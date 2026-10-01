import "server-only";
import { timed } from "@/lib/performance";
import { databaseReads } from "@/lib/database-reads";
import { getPrisma } from "@/lib/prisma";
import type { Prisma, Enrollment, LessonProgress } from "@/generated/prisma/client";
import { badgeMet, learningProgress, roadmapStates, streak } from "@/lib/learning-rules";

export type Database = Prisma.TransactionClient;
export class LearningError extends Error {}
export async function lockLearningUser(db: Database, userId: string) {
  await db.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
  // Serialize curriculum edits with learning writes. Always lock courses in ID order.
  await db.$queryRaw`SELECT "id" FROM "Course" WHERE "id" IN (SELECT "courseId" FROM "Enrollment" WHERE "userId" = ${userId}) ORDER BY "id" FOR UPDATE`;
}

// Learning calculations need neither course nor lesson image blobs. Only the player reads its thumbnail.
export const learningCourseSelect = {
    id: true, slug: true, title: true, description: true, level: true, instructorName: true, status: true,
    modules: { orderBy: { order: "asc" }, select: { id: true, title: true, description: true, order: true, lessons: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { id: true, slug: true, moduleId: true, title: true, description: true, order: true, durationSeconds: true, videoUrl: true } } } },
    quizzes: { where: { status: "PUBLISHED" }, select: { id: true, slug: true, title: true, moduleId: true, _count: { select: { questions: true } } } },
    roadmapNodes: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true, type: true, lessonId: true, quizId: true, badgeId: true } },
  } satisfies Prisma.CourseSelect;
type CourseGraph = Prisma.CourseGetPayload<{ select: typeof learningCourseSelect }>;
type AttemptSummary = { id: string; quizId: string; passed: boolean | null; completedAt: Date | null; score: number | null };
const studentLearningSelect = {
  enrollments: { where: { course: { status: "PUBLISHED" } }, orderBy: { enrolledAt: "desc" }, include: { course: { select: learningCourseSelect } } },
  lessonProgress: { include: { lesson: { select: { title: true } } } },
  quizAttempts: { where: { completedAt: { not: null }, quiz: { status: "PUBLISHED", course: { status: "PUBLISHED" } } }, orderBy: { completedAt: "desc" }, select: { id: true, quizId: true, score: true, passed: true, completedAt: true, quiz: { select: { title: true, slug: true } } } },
} satisfies Prisma.UserSelect;

// Two joined reads and one batch insert, irrespective of the number of learners.
// Award history is monotonic: changed requirements never revoke an earned badge.
export async function reconcileBadgesForUsers(userIds: string[] | null, db: Database, badgeId?: string) {
  if (userIds?.length === 0) return;
  const where = userIds ? { id: { in: userIds } } : { OR: [{ enrollments: { some: {} } }, { lessonProgress: { some: {} } }, { quizAttempts: { some: {} } }] };
  const [users, badges] = await databaseReads(db, [
    () => db.user.findMany({ where, select: { id: true, ...studentLearningSelect } }),
    () => db.badge.findMany({ where: { status: "ACTIVE", ...(badgeId ? { id: badgeId } : {}) }, select: { id: true, conditionType: true, conditionValue: true, users: { where: userIds ? { userId: { in: userIds } } : {}, select: { userId: true } } } }),
  ]);
  const awards: { userId: string; badgeId: string }[] = [];
  const earned = new Map(badges.map(b => [b.id, new Set(b.users.map(u => u.userId))]));
  for (const user of users) {
    const states = user.enrollments.map(e => deriveCourseState(e.course, e, user.lessonProgress, user.quizAttempts, []));
    const stats = { modules: states.reduce((n,s) => n+s.completedModules,0), courses: states.filter(s => s.complete).length, quizzes: states.reduce((n,s) => n+s.passed.size,0), streak: streak([...user.lessonProgress,...user.quizAttempts].flatMap(row => row.completedAt ? [row.completedAt] : [])).days };
    for (const badge of badges) if (!earned.get(badge.id)?.has(user.id) && badgeMet(badge.conditionType, badge.conditionValue, stats)) awards.push({ userId: user.id, badgeId: badge.id });
  }
  if (awards.length) await db.userBadge.createMany({ data: awards, skipDuplicates: true });
}

export async function courseState(userId: string | null, slug: string, db: Database = getPrisma()) {
  return timed("service.courseState", () => courseStateMeasured(userId, slug, db));
}
async function courseStateMeasured(userId: string | null, slug: string, db: Database = getPrisma()) {
  const course = await db.course.findFirst({ where: { slug, status: "PUBLISHED" }, select: learningCourseSelect });
  if (!course) return null;
  const lessons = course.modules.flatMap(module => module.lessons);
  // One joined, course-scoped student read; no profile fields, images or answers.
  const student = userId ? await db.user.findUnique({ where: { id: userId }, relationLoadStrategy: "join", select: {
    enrollments: { where: { courseId: course.id } },
    lessonProgress: { where: { lessonId: { in: lessons.map(l => l.id) } } },
    quizAttempts: { where: { quizId: { in: course.quizzes.map(q => q.id) }, completedAt: { not: null } }, select: { id: true, quizId: true, passed: true, completedAt: true, score: true }, orderBy: { completedAt: "desc" } },
    badges: { select: { badgeId: true } },
  } }) : null;
  return deriveCourseState(course, student?.enrollments[0] ?? null, student?.lessonProgress ?? [], student?.quizAttempts ?? [], student?.badges ?? []);
}
export function deriveCourseState(course: CourseGraph, enrollment: Enrollment | null, allProgress: LessonProgress[], allAttempts: AttemptSummary[], awards: { badgeId: string }[]) {
  // Preserve stored module order/numbers while hiding unpublished curriculum structure.
  course = { ...course, modules: course.modules.filter(module => module.lessons.length > 0 || course.quizzes.some(quiz => quiz.moduleId === module.id)) };
  const lessons = course.modules.flatMap(module => module.lessons);
  const progress = allProgress.filter(p => lessons.some(l => l.id === p.lessonId));
  const attempts = allAttempts.filter(a => course.quizzes.some(q => q.id === a.quizId));
  const completed = new Set(progress.filter(p => p.status === "COMPLETED").map(p => p.lessonId));
  const passed = new Set(attempts.filter(a => a.passed).map(a => a.quizId));
  const validNodes = course.roadmapNodes.filter(n => n.type === "LESSON" ? lessons.some(l => l.id === n.lessonId) : n.type === "QUIZ" ? course.quizzes.some(q => q.id === n.quizId) : Boolean(n.badgeId));
  const nodes = roadmapStates(validNodes, Boolean(enrollment), completed, passed, new Set(awards.map(a => a.badgeId)));
  const moduleComplete = (moduleId: string) => {
    const moduleLessons = lessons.filter(l => l.moduleId === moduleId);
    const quizzes = course.quizzes.filter(q => q.moduleId === moduleId);
    return learningProgress(moduleLessons.filter(l => completed.has(l.id)).length, moduleLessons.length, quizzes.filter(q => passed.has(q.id)).length, quizzes.length).complete;
  };
  const units = learningProgress(completed.size, lessons.length, passed.size, course.quizzes.length);
  const complete = units.complete;
  const current = nodes.find(n => n.status === "current" && n.type !== "REWARD");
  return { course, lessons, enrollment, progress, attempts, completed, passed, nodes, complete,
    completedLessons: completed.size, totalLessons: lessons.length, completedUnits: units.completed, totalUnits: units.total, percentage: units.percentage,
    completedModules: course.modules.filter(m => moduleComplete(m.id)).length, moduleComplete,
    current, currentLesson: lessons.find(l => l.id === current?.lessonId) ?? null,
  };
}
export type CourseState = NonNullable<Awaited<ReturnType<typeof courseState>>>;
export function nodeHref(state: CourseState, node: CourseState["nodes"][number] | undefined) {
  if (!node) return `/courses/${state.course.slug}`;
  if (node.type === "LESSON") return `/learn/${state.lessons.find(l => l.id === node.lessonId)?.slug}`;
  if (node.type === "QUIZ") return `/quizzes/${state.course.quizzes.find(q => q.id === node.quizId)?.slug}`;
  return "/achievements";
}
export async function accessible(userId: string, kind: "LESSON" | "QUIZ", slug: string, db: Database = getPrisma()) {
  return timed("service.accessible", () => accessibleMeasured(userId, kind, slug, db));
}
async function accessibleMeasured(userId: string, kind: "LESSON" | "QUIZ", slug: string, db: Database = getPrisma()) {
  const resource = kind === "LESSON" ? await db.lesson.findFirst({ where: { slug, status: "PUBLISHED" }, select: { id: true, module: { select: { course: { select: { slug: true } } } } } }) : await db.quiz.findFirst({ where: { slug, status: "PUBLISHED" }, select: { id: true, course: { select: { slug: true } } } });
  if (!resource) return null;
  const courseSlug = "module" in resource ? resource.module.course.slug : resource.course.slug;
  const state = await courseState(userId, courseSlug, db);
  if (!state) return null;
  const node = state.nodes.find(n => kind === "LESSON" ? n.lessonId === resource.id : n.quizId === resource.id);
  // Fail closed for content missing from the configured linear learning path.
  if (!state.enrollment || !node || node.status === "locked") throw new LearningError("Enroll and complete earlier roadmap steps first.");
  return { state, id: resource.id, node };
}
export async function evaluateBadgesForUser(userId: string, db: Database = getPrisma(), overview?: StudentOverview) {
  return timed("service.evaluateBadgesForUser", () => evaluateBadgesForUserMeasured(userId, db, overview));
}
async function evaluateBadgesForUserMeasured(userId: string, db: Database = getPrisma(), overview?: StudentOverview) {
  const { states, badges, streak: activityStreak } = overview ?? await studentOverview(userId, db);
  const stats = { modules: states.reduce((sum, s) => sum + s.completedModules, 0), courses: states.filter(s => s.complete).length, quizzes: states.reduce((n,s) => n+s.passed.size,0), streak: activityStreak.days };
  const awards = badges.filter(b => b.status === "ACTIVE" && !b.users.length && badgeMet(b.conditionType, b.conditionValue, stats));
  if (awards.length) await db.userBadge.createMany({ data: awards.map(b => ({ userId, badgeId: b.id })), skipDuplicates: true });
  for (const state of states) {
    if (state.complete !== Boolean(state.enrollment?.completedAt)) await syncEnrollmentCompletion(userId, state.course.id, state.complete, db);
  }
}

// completedAt describes CURRENT requirements, not a historical certificate.
// Preserve an existing completion date until requirements stop being satisfied.
export async function syncEnrollmentCompletion(userId: string, courseId: string, complete: boolean, db: Database) {
  return timed("service.syncEnrollmentCompletion", () => syncEnrollmentCompletionMeasured(userId, courseId, complete, db));
}
async function syncEnrollmentCompletionMeasured(userId: string, courseId: string, complete: boolean, db: Database) {
  await db.enrollment.updateMany({
    where: { userId, courseId, completedAt: complete ? null : { not: null } },
    data: { completedAt: complete ? new Date() : null },
  });
}

// Caller holds the course lock in the same transaction as the curriculum edit.
// Course visibility does not erase progress; only published learning requirements count.
export async function reconcileCourseEnrollments(courseId: string, db: Database) {
  const course = await db.course.findUnique({ where: { id: courseId }, select: learningCourseSelect });
  if (!course) return;
  const enrollments = await db.enrollment.findMany({ where: { courseId } });
  if (!enrollments.length) return;
  const userIds = enrollments.map(e => e.userId);
  const [progress, attempts] = await databaseReads(db, [
    () => db.lessonProgress.findMany({ where: { userId: { in: userIds }, lesson: { module: { courseId } } } }),
    () => db.quizAttempt.findMany({ where: { userId: { in: userIds }, quiz: { courseId }, completedAt: { not: null } }, select: { id: true, userId: true, quizId: true, passed: true, completedAt: true, score: true } }),
  ]);
  const completedUsers: string[] = [], incompleteUsers: string[] = [];
  for (const enrollment of enrollments) {
    const state = deriveCourseState(course, enrollment, progress.filter(p => p.userId === enrollment.userId), attempts.filter(a => a.userId === enrollment.userId), []);
    if (state.complete !== Boolean(enrollment.completedAt)) (state.complete ? completedUsers : incompleteUsers).push(enrollment.userId);
  }
  if (completedUsers.length) await db.enrollment.updateMany({ where: { courseId, userId: { in: completedUsers }, completedAt: null }, data: { completedAt: new Date() } });
  if (incompleteUsers.length) await db.enrollment.updateMany({ where: { courseId, userId: { in: incompleteUsers }, completedAt: { not: null } }, data: { completedAt: null } });
  await reconcileBadgesForUsers(userIds, db);
}

export async function studentOverview(userId: string, db: Database = getPrisma()) {
  return timed("service.studentOverview", () => studentOverviewMeasured(userId, db));
}
async function studentOverviewMeasured(userId: string, db: Database = getPrisma()) {
  const [learning, badges] = await databaseReads(db, [
    () => db.user.findUniqueOrThrow({ where: { id: userId }, select: studentLearningSelect }),
    () => studentBadges(userId, db),
  ]);
  const { enrollments, lessonProgress: progress, quizAttempts: attempts } = learning;
  const states = enrollments.map(e => deriveCourseState(e.course, e, progress, attempts, badges.filter(b => b.users.length).map(b => ({ badgeId: b.id }))));

  const completed = states.reduce((n, s) => n + s.completedLessons, 0), total = states.reduce((n, s) => n + s.totalLessons, 0);
  const units = learningProgress(completed, total, states.reduce((n,s) => n+s.passed.size,0), states.reduce((n,s) => n+s.course.quizzes.length,0));
  return { states, active: states.find(s => !s.complete) ?? states[0] ?? null, badges, progress, attempts, completed, total, completedUnits: units.completed, totalUnits: units.total, percentage: units.percentage, streak: streak([...progress, ...attempts].flatMap(a => a.completedAt ? [a.completedAt] : [])) };
}

export async function studentBadges(userId: string, db: Database = getPrisma()) {
  const badges = await db.badge.findMany({ where: { OR: [{ status: "ACTIVE" }, { users: { some: { userId } } }] }, include: { users: { where: { userId }, select: { earnedAt: true } } } });
  badges.sort((a,b) => (b.users[0]?.earnedAt.getTime() ?? 0) - (a.users[0]?.earnedAt.getTime() ?? 0));
  return badges;
}

export type StudentOverview = Awaited<ReturnType<typeof studentOverview>>;
export function overviewWithQuizAttempt(overview: StudentOverview, attempt: StudentOverview["attempts"][number]): StudentOverview {
  const attempts = [attempt, ...overview.attempts.filter(row => row.id !== attempt.id)];
  const awards = overview.badges.filter(b => b.users.length).map(b => ({ badgeId: b.id }));
  const states = overview.states.map(state => deriveCourseState(state.course, state.enrollment, overview.progress, attempts, awards));
  const units = learningProgress(overview.completed, overview.total, states.reduce((n,s)=>n+s.passed.size,0),states.reduce((n,s)=>n+s.course.quizzes.length,0));
  return { ...overview, attempts, states, completedUnits:units.completed,totalUnits:units.total,percentage:units.percentage, active: states.find(state => !state.complete) ?? states[0] ?? null,
    streak: streak([...overview.progress, ...attempts].flatMap(row => row.completedAt ? [row.completedAt] : [])) };
}
// Reuse the transaction snapshot after our own write, without fetching it again.
export function overviewWithCompletedLesson(overview: StudentOverview, row: LessonProgress, title: string): StudentOverview {
  const progress = [...overview.progress.filter(p => p.lessonId !== row.lessonId), { ...row, lesson: { title } }];
  const awards = overview.badges.filter(b => b.users.length).map(b => ({ badgeId: b.id }));
  const states = overview.states.map(state => deriveCourseState(state.course, state.enrollment, progress, overview.attempts, awards));
  const completed = states.reduce((sum, state) => sum + state.completedLessons, 0);
  const units = learningProgress(completed, overview.total, states.reduce((n,s)=>n+s.passed.size,0),states.reduce((n,s)=>n+s.course.quizzes.length,0));
  return { ...overview, states, progress, completed, completedUnits:units.completed,totalUnits:units.total, percentage: units.percentage,
    active: states.find(s => !s.complete) ?? states[0] ?? null,
    streak: streak([...progress, ...overview.attempts].flatMap(p => p.completedAt ? [p.completedAt] : [])) };
}
