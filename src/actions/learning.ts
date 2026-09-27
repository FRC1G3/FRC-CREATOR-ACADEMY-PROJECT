"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import { idSchema, profileSchema, quizSubmissionSchema, type ActionState } from "@/lib/validation";
import { accessible, courseState, syncEnrollmentCompletion, evaluateBadgesForUser, LearningError, lockLearningUser } from "@/services/learning";
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
  const user = await requireUser();
  const slug = idSchema.safeParse(data.get("slug"));
  if (!slug.success) return { error: "Invalid lesson." };
  try {
    await getPrisma().$transaction(async db => {
      await lockLearningUser(db, user.id);
      const access = await accessible(user.id, "LESSON", slug.data, db);
      if (!access) throw new LearningError("Lesson unavailable.");
      await db.lessonProgress.upsert({ where: { userId_lessonId: { userId: user.id, lessonId: access.id } }, create: { userId: user.id, lessonId: access.id, status: "COMPLETED", startedAt: new Date(), completedAt: new Date() }, update: {} });
      await db.lessonProgress.updateMany({ where: { userId: user.id, lessonId: access.id, status: { not: "COMPLETED" } }, data: { status: "COMPLETED", completedAt: new Date() } });
      await evaluateBadgesForUser(user.id, db);
    }, { timeout: 30000 });
    refresh(); return { success: "Lesson completed." };
  } catch (error) { return { error: error instanceof LearningError ? error.message : "Unable to save progress. Please try again." }; }
}
export async function saveProfile(_: ActionState, data: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: "Check your name, bio and avatar URL." };
  try { await getPrisma().user.update({ where: { id: user.id }, data: { ...parsed.data, avatarUrl: parsed.data.avatarUrl || null } }); refresh(); return { success: "Profile saved." }; }
  catch { return { error: "Unable to save profile." }; }
}
export async function submitQuiz(input: unknown): Promise<{ error?: string; url?: string }> {
  const user = await requireUser();
  const parsed = quizSubmissionSchema.safeParse(input);
  if (!parsed.success) return { error: "Answer every question before submitting." };
  const { quizId: slug, requestId, answers } = parsed.data;
  try {
    const result = await getPrisma().$transaction(async db => {
      await lockLearningUser(db, user.id);
      const access = await accessible(user.id, "QUIZ", slug, db);
      if (!access) throw new LearningError("Quiz unavailable.");
      await db.$queryRaw`SELECT "id" FROM "Quiz" WHERE "id" = ${access.id} FOR UPDATE`;
      const prior = await db.quizAttempt.findUnique({ where: { id: requestId }, select: { id: true, userId: true, quizId: true } });
      if (prior) { if (prior.userId !== user.id || prior.quizId !== access.id) throw new LearningError("Invalid submission."); return prior.id; }
      const quiz = await db.quiz.findUniqueOrThrow({ where: { id: access.id }, include: { questions: { include: { options: true } } } });
      if (quiz.status !== "PUBLISHED") throw new LearningError("Quiz unavailable.");
      const graded = scoreAnswers(quiz.questions, answers, quiz.passScore);
      await db.quizAttempt.create({ data: { id: requestId, userId: user.id, quizId: quiz.id, score: graded.score, passed: graded.passed, completedAt: new Date(), answers: { create: graded.rows } } });
      await evaluateBadgesForUser(user.id, db);
      return requestId;
    }, { timeout: 30000 });
    refresh(); revalidatePath(`/quizzes/${slug}/result`);
    return { url: `/quizzes/${encodeURIComponent(slug)}/result?attempt=${result}` };
  } catch (error) { return { error: error instanceof LearningError ? error.message : "Unable to submit quiz. Check your answers and try again." }; }
}
