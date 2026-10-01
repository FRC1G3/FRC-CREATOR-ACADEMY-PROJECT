"use server";
import { timed } from "@/lib/performance";
import { normalizeAvatar } from "@/lib/avatar-server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import { idSchema, profileSchema, quizSubmissionSchema, type ActionState } from "@/lib/validation";
import { studentOverview, overviewWithCompletedLesson, overviewWithQuizAttempt, accessible, courseState, syncEnrollmentCompletion, evaluateBadgesForUser, LearningError, lockLearningUser } from "@/services/learning";
import { scoreAnswers } from "@/lib/learning-rules";
import { redirect } from "next/navigation";

function refresh() { for (const path of ["/dashboard", "/profile", "/roadmap", "/achievements", "/courses"]) revalidatePath(path); revalidatePath("/courses/[courseId]", "page"); revalidatePath("/learn/[lessonId]", "page"); }
export async function enroll(_: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser();
  const slug = idSchema.safeParse(data.get("slug"));
  if (!slug.success) return { error: "Invalid course." };
  try {
    const db = getPrisma();
    const course = await db.course.findFirst({ where: { slug: slug.data, status: "PUBLISHED" }, select: { id: true } });
    if (!course) return { error: "Course unavailable." };
    await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;
      await tx.$queryRaw`SELECT "id" FROM "Course" WHERE "id" = ${course.id} FOR UPDATE`;
      const current = await tx.course.findFirst({ where: { id: course.id, status: "PUBLISHED" }, select: { id: true } });
      if (!current) throw new LearningError("Course unavailable.");
      await tx.enrollment.upsert({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, create: { userId: user.id, courseId: course.id }, update: {} });
      const state = await courseState(user.id, slug.data, tx);
      if (state) await syncEnrollmentCompletion(user.id, course.id, state.complete, tx);
    }, { timeout: 30000 });
    refresh();
  } catch { return { error: "Unable to enroll. Please try again." }; }
  redirect(`/roadmap?course=${encodeURIComponent(slug.data)}`);
}
export async function startLesson(slug: string) {
  const user = await requireUser();
  if (!idSchema.safeParse(slug).success) return;
  const access = await accessible(user.id, "LESSON", slug);
  if (!access) return;
  await getPrisma().lessonProgress.upsert({ where: { userId_lessonId: { userId: user.id, lessonId: access.id } }, create: { userId: user.id, lessonId: access.id, status: "IN_PROGRESS", startedAt: new Date() }, update: {} });
  await getPrisma().lessonProgress.updateMany({ where: { userId: user.id, lessonId: access.id, status: "NOT_STARTED" }, data: { status: "IN_PROGRESS", startedAt: new Date() } });
}
export async function completeLesson(_: ActionState, data: FormData): Promise<ActionState> {
  return timed("complete.total", () => completeLessonMeasured(_, data));
}
async function completeLessonMeasured(_: ActionState, data: FormData): Promise<ActionState> {
  const user = await timed("complete.auth", () => requireUser());
  const slug = idSchema.safeParse(data.get("slug"));
  if (!slug.success) return { error: "Invalid lesson." };
  try {
    await getPrisma().$transaction(async db => {
      await timed("complete.locks", () => lockLearningUser(db, user.id));
      let overview = await timed("complete.snapshot", () => studentOverview(user.id, db));
      const access = await timed("complete.access", () => {
        const state = overview.states.find(s => s.lessons.some(l => l.slug === slug.data));
        const lesson = state?.lessons.find(l => l.slug === slug.data);
        if (!state || !lesson) throw new LearningError("Lesson unavailable.");
        const node = state.nodes.find(n => n.lessonId === lesson.id);
        if (!state.enrollment || !node || node.status === "locked") throw new LearningError("Enroll and complete earlier roadmap steps first.");
        return { state, lesson };
      });
      if (!access.state.completed.has(access.lesson.id)) {
        const now = new Date();
        const row = await timed("complete.write", () => db.lessonProgress.upsert({
          where: { userId_lessonId: { userId: user.id, lessonId: access.lesson.id } },
          create: { userId: user.id, lessonId: access.lesson.id, status: "COMPLETED", startedAt: now, completedAt: now },
          update: { status: "COMPLETED", completedAt: now },
        }));
        overview = await timed("complete.derive", () => overviewWithCompletedLesson(overview, row, access.lesson.title));
      }
      await timed("complete.badges", () => evaluateBadgesForUser(user.id, db, overview));
    }, { timeout: 30000 });
    await timed("complete.revalidation", () => refresh()); return { success: "Lesson completed." };
  } catch (error) { return { error: error instanceof LearningError ? error.message : "Unable to save progress. Please try again." }; }
}
export async function saveProfile(_: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: "Check your name, bio and profile photo." };
  let avatarUrl = parsed.data.avatarUrl || null;
  if (avatarUrl?.startsWith("data:")) {
    try { avatarUrl = await normalizeAvatar(avatarUrl); }
    catch { return { error: "Invalid profile photo. Please choose another JPEG, PNG or WebP image." }; }
  }
  try { await getPrisma().user.update({ where: { id: user.id }, data: { ...parsed.data, avatarUrl } }); revalidatePath("/", "layout"); return { success: "Profile updated successfully." }; }
  catch { return { error: "Unable to save profile." }; }
}
export async function submitQuiz(input: unknown): Promise<{ error?: string; url?: string }> {
  return timed("quiz.total", () => submitQuizMeasured(input));
}
async function submitQuizMeasured(input: unknown): Promise<{ error?: string; url?: string }> {
  const user = await timed("quiz.auth", () => requireUser());
  const parsed = quizSubmissionSchema.safeParse(input);
  if (!parsed.success) return { error: "Answer every question before submitting." };
  const { quizId: slug, requestId, answers } = parsed.data;
  try {
    const result = await getPrisma().$transaction(async db => {
      await timed("quiz.locks", () => lockLearningUser(db, user.id));
      const overview = await timed("quiz.snapshot", () => studentOverview(user.id, db));
      const access = await timed("quiz.access", () => {
        const state = overview.states.find(s => s.course.quizzes.some(q => q.slug === slug));
        const quiz = state?.course.quizzes.find(q => q.slug === slug);
        if (!state || !quiz) throw new LearningError("Quiz unavailable.");
        const node = state.nodes.find(n => n.quizId === quiz.id);
        if (!state.enrollment || !node || node.status === "locked") throw new LearningError("Enroll and complete earlier roadmap steps first.");
        return quiz;
      });
      await timed("quiz.quiz-lock", () => db.$queryRaw`SELECT "id" FROM "Quiz" WHERE "id" = ${access.id} FOR UPDATE`);
      const prior = await timed("quiz.idempotency", () => db.quizAttempt.findUnique({ where: { id: requestId }, select: { id: true, userId: true, quizId: true } }));
      if (prior) { if (prior.userId !== user.id || prior.quizId !== access.id) throw new LearningError("Invalid submission."); return prior.id; }
      const quiz = await timed("quiz.questions", () => db.quiz.findUniqueOrThrow({ relationLoadStrategy: "join", where: { id: access.id }, select: { id: true, status: true, passScore: true, questions: { select: { id: true, options: { select: { id: true, isCorrect: true } } } } } }));
      if (quiz.status !== "PUBLISHED") throw new LearningError("Quiz unavailable.");
      const graded = await timed("quiz.score", () => scoreAnswers(quiz.questions, answers, quiz.passScore));
      // Keep both writes in this transaction; avoid the nested create's extra result read.
      const attempt = await timed("quiz.write", async () => {
        const row = await timed("quiz.attempt", () => db.quizAttempt.create({
          data: { id: requestId, userId: user.id, quizId: quiz.id, score: graded.score, passed: graded.passed, completedAt: new Date() },
          select: { id: true, quizId: true, score: true, passed: true, completedAt: true },
        }));
        await timed("quiz.answers", () => db.quizAnswer.createMany({ data: graded.rows.map(answer => ({ ...answer, attemptId: row.id })) }));
        return row;
      });
      const updated = await timed("quiz.derive", () => overviewWithQuizAttempt(overview, { ...attempt, quiz: { title: access.title, slug: access.slug } }));
      await timed("quiz.badges-completion", () => evaluateBadgesForUser(user.id, db, updated));
      return requestId;
    }, { timeout: 30000 });
    await timed("quiz.revalidation", () => { refresh(); revalidatePath(`/quizzes/${slug}/result`); });
    return { url: `/quizzes/${encodeURIComponent(slug)}/result?attempt=${result}` };
  } catch (error) { return { error: error instanceof LearningError ? error.message : "Unable to submit quiz. Check your answers and try again." }; }
}
