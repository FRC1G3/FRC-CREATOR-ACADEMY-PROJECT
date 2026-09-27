import "server-only";
import { timed } from "@/lib/performance";
import { databaseReads } from "@/lib/database-reads";
import { getPrisma } from "@/lib/prisma";
import type { Prisma, Enrollment, LessonProgress } from "@/generated/prisma/client";
import { badgeMet, percentage, roadmapStates, streak } from "@/lib/learning-rules";

export type Database = Prisma.TransactionClient;
export class LearningError extends Error {}
export async function lockLearningUser(db: Database, userId: string) {
  await db.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
  // Serialize curriculum edits with learning writes. Always lock courses in ID order.
  await db.$queryRaw`SELECT "id" FROM "Course" WHERE "id" IN (SELECT "courseId" FROM "Enrollment" WHERE "userId" = ${userId}) ORDER BY "id" FOR UPDATE`;
}

const courseGraph = {
    modules: { orderBy: { order: "asc" }, include: { lessons: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } } } },
    quizzes: { where: { status: "PUBLISHED" }, include: { _count: { select: { questions: true } } } },
    roadmapNodes: { orderBy: { order: "asc" } },
  } satisfies Prisma.CourseInclude;
type CourseGraph = Prisma.CourseGetPayload<{ include: typeof courseGraph }>;
type AttemptSummary = { id: string; quizId: string; passed: boolean | null; completedAt: Date | null; score: number | null };

export async function courseState(userId: string | null, slug: string, db: Database = getPrisma()) {
  return timed("service.courseState", () => courseStateMeasured(userId, slug, db));
}
async function courseStateMeasured(userId: string | null, slug: string, db: Database = getPrisma()) {
  const course = await db.course.findFirst({ where: { slug, status: "PUBLISHED" }, include: courseGraph });
  if (!course) return null;
  const lessons = course.modules.flatMap(module => module.lessons);
  const [enrollment, progress, attempts, awards] = userId ? await databaseReads(db, [
    () => db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } }),
    () => db.lessonProgress.findMany({ where: { userId, lessonId: { in: lessons.map(l => l.id) } } }),
    () => db.quizAttempt.findMany({ where: { userId, quizId: { in: course.quizzes.map(q => q.id) }, completedAt: { not: null } }, select: { id: true, quizId: true, passed: true, completedAt: true, score: true }, orderBy: { completedAt: "desc" } }),
    () => db.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ]) : [null, [], [], []];
  return deriveCourseState(course, enrollment, progress, attempts, awards);
}
export function deriveCourseState(course: CourseGraph, enrollment: Enrollment | null, allProgress: LessonProgress[], allAttempts: AttemptSummary[], awards: { badgeId: string }[]) {
  const lessons = course.modules.flatMap(module => module.lessons);
  const progress = allProgress.filter(p => lessons.some(l => l.id === p.lessonId));
  const attempts = allAttempts.filter(a => course.quizzes.some(q => q.id === a.quizId));
  const completed = new Set(progress.filter(p => p.status === "COMPLETED").map(p => p.lessonId));
  const passed = new Set(attempts.filter(a => a.passed).map(a => a.quizId));
  const validNodes = course.roadmapNodes.filter(n => n.type === "LESSON" ? lessons.some(l => l.id === n.lessonId) : n.type === "QUIZ" ? course.quizzes.some(q => q.id === n.quizId) : Boolean(n.badgeId));
  const nodes = roadmapStates(validNodes, Boolean(enrollment), completed, passed, new Set(awards.map(a => a.badgeId)));
  const moduleComplete = (moduleId: string) => {
    const moduleLessons = lessons.filter(l => l.moduleId === moduleId);
    return moduleLessons.length > 0 && moduleLessons.every(l => completed.has(l.id)) && course.quizzes.filter(q => q.moduleId === moduleId).every(q => passed.has(q.id));
  };
  const complete = lessons.length > 0 && completed.size === lessons.length && course.quizzes.every(q => passed.has(q.id));
  const current = nodes.find(n => n.status === "current" && n.type !== "REWARD");
  return { course, lessons, enrollment, progress, attempts, completed, passed, nodes, complete,
    completedLessons: completed.size, totalLessons: lessons.length, percentage: percentage(completed.size, lessons.length),
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
  const course = await db.course.findUnique({ where: { id: courseId }, include: courseGraph });
  if (!course) return;
  const enrollments = await db.enrollment.findMany({ where: { courseId } });
  if (!enrollments.length) return;
  const userIds = enrollments.map(e => e.userId);
  const [progress, attempts] = await databaseReads(db, [
    () => db.lessonProgress.findMany({ where: { userId: { in: userIds }, lesson: { module: { courseId } } } }),
    () => db.quizAttempt.findMany({ where: { userId: { in: userIds }, quiz: { courseId }, completedAt: { not: null } }, select: { id: true, userId: true, quizId: true, passed: true, completedAt: true, score: true } }),
  ]);
  for (const enrollment of enrollments) {
    const state = deriveCourseState(course, enrollment, progress.filter(p => p.userId === enrollment.userId), attempts.filter(a => a.userId === enrollment.userId), []);
    await syncEnrollmentCompletion(enrollment.userId, courseId, state.complete, db);
  }
}

export async function studentOverview(userId: string, db: Database = getPrisma()) {
  return timed("service.studentOverview", () => studentOverviewMeasured(userId, db));
}
async function studentOverviewMeasured(userId: string, db: Database = getPrisma()) {
  const [learning, badges] = await databaseReads(db, [
    () => db.user.findUniqueOrThrow({ where: { id: userId }, select: {
      enrollments: { where: { course: { status: "PUBLISHED" } }, orderBy: { enrolledAt: "desc" }, include: { course: { include: courseGraph } } },
      lessonProgress: { include: { lesson: { select: { title: true } } } },
      quizAttempts: { where: { completedAt: { not: null }, quiz: { status: "PUBLISHED", course: { status: "PUBLISHED" } } }, orderBy: { completedAt: "desc" }, select: { id: true, quizId: true, score: true, passed: true, completedAt: true, quiz: { select: { title: true, slug: true } } } },
    } }),
    () => studentBadges(userId, db),
  ]);
  const { enrollments, lessonProgress: progress, quizAttempts: attempts } = learning;
  const states = enrollments.map(e => deriveCourseState(e.course, e, progress, attempts, badges.filter(b => b.users.length).map(b => ({ badgeId: b.id }))));

  const completed = states.reduce((n, s) => n + s.completedLessons, 0), total = states.reduce((n, s) => n + s.totalLessons, 0);
  return { states, active: states.find(s => !s.complete) ?? states[0] ?? null, badges, progress, attempts, completed, total, percentage: percentage(completed, total), streak: streak([...progress, ...attempts].flatMap(a => a.completedAt ? [a.completedAt] : [])) };
}

export async function studentBadges(userId: string, db: Database = getPrisma()) {
  const badges = await db.badge.findMany({ where: { OR: [{ status: "ACTIVE" }, { users: { some: { userId } } }] }, include: { users: { where: { userId }, select: { earnedAt: true } } } });
  badges.sort((a,b) => (b.users[0]?.earnedAt.getTime() ?? 0) - (a.users[0]?.earnedAt.getTime() ?? 0));
  return badges;
}

export type StudentOverview = Awaited<ReturnType<typeof studentOverview>>;
// Reuse the transaction snapshot after our own write, without fetching it again.
export function overviewWithCompletedLesson(overview: StudentOverview, row: LessonProgress, title: string): StudentOverview {
  const progress = [...overview.progress.filter(p => p.lessonId !== row.lessonId), { ...row, lesson: { title } }];
  const awards = overview.badges.filter(b => b.users.length).map(b => ({ badgeId: b.id }));
  const states = overview.states.map(state => deriveCourseState(state.course, state.enrollment, progress, overview.attempts, awards));
  const completed = states.reduce((sum, state) => sum + state.completedLessons, 0);
  return { ...overview, states, progress, completed, percentage: percentage(completed, overview.total),
    active: states.find(s => !s.complete) ?? states[0] ?? null,
    streak: streak([...progress, ...overview.attempts].flatMap(p => p.completedAt ? [p.completedAt] : [])) };
}
