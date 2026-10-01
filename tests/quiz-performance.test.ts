// Opt-in real DB profiling; default test runs never connect or create fixtures.
import "dotenv/config";
import { it, expect, vi } from "vitest";
import { randomUUID, createHmac } from "node:crypto";
const request = vi.hoisted(() => ({ cookie: "" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ cookie: request.cookie }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { getPrisma } from "../src/lib/prisma";
import { submitQuiz } from "../src/actions/learning";
import { timed } from "../src/lib/performance";
import ResultPage from "../src/app/quizzes/[quizId]/result/page";
import CoursePage from "../src/app/courses/[courseId]/page";
import { adminLessons } from "../src/services/admin-queries";
import { courseState } from "../src/services/learning";

it.skipIf(process.env.RUN_QUIZ_PROFILE !== "1")("profiles isolated quiz submissions and hot route data", async () => {
  const db = getPrisma(), suffix = randomUUID(), userId = randomUUID(), courseId = randomUUID();
  try {
    const token = randomUUID();
    await db.user.create({ data: { id: userId, name: "Temporary Quiz Profile", email: `${suffix}@example.invalid`, role: "ADMIN", sessions: { create: { token, expiresAt: new Date(Date.now() + 3600000) } } } });
    // Better Auth signs cookies; use its public session cookie helper rather than bypassing session resolution.
    const { getAuth } = await import("../src/lib/auth");
    const auth = getAuth();
    const context = await auth.$context;

    request.cookie = `${context.authCookies.sessionToken.name}=${encodeURIComponent(`${token}.${createHmac("sha256", context.secret).update(token).digest("base64")}`)}`;
    const course = await db.course.create({ data: { id: courseId, title: "Profile Course", slug: `profile-${suffix}`, shortDescription: "Test", description: "Test", instructorName: "Test", status: "PUBLISHED", enrollments: { create: { userId } } } });
    const quiz = await db.quiz.create({ data: {
      courseId, title: "Profile Quiz", slug: `quiz-${suffix}`, status: "PUBLISHED",
      questions: { create: Array.from({ length: 10 }, (_, i) => ({
        text: `Question ${i}`, order: i + 1,
        options: { create: [{ text: "Correct", isCorrect: true, order: 1 }, { text: "Wrong", isCorrect: false, order: 2 }] }
      })) }
    }, include: { questions: { include: { options: true } } } });
    await db.roadmapNode.create({ data: { courseId, quizId: quiz.id, type: "QUIZ", title: "Checkpoint", order: 1 } });
    let lastRequest = "";
    const answers = quiz.questions.map(q => ({ questionId: q.id, optionId: q.options.find(o => o.isCorrect)!.id }));
    for (let run = 0; run < 3; run++) {
      const requestId = randomUUID();
      lastRequest = requestId;
      const result = await submitQuiz({ quizId: quiz.slug, requestId, answers });
      expect(result.error).toBeUndefined();
      expect(result.url).toContain(requestId);
      expect(await db.quizAnswer.count({ where: { attemptId: requestId } })).toBe(10);
      await timed("profile.result-page", () => ResultPage({ params: Promise.resolve({ quizId: quiz.slug }), searchParams: Promise.resolve({ attempt: requestId }) }));
      await timed("profile.course-page", () => CoursePage({ params: Promise.resolve({ courseId: course.slug }) }));
    }
    const completion = await db.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId, courseId } } });
    expect(completion.completedAt).not.toBeNull();
    // The same request cannot duplicate either history table.
    expect((await submitQuiz({ quizId: quiz.slug, requestId: lastRequest, answers })).url).toContain(lastRequest);
    expect(await db.quizAttempt.count({ where: { userId } })).toBe(3);
    expect(await db.quizAnswer.count({ where: { attempt: { userId } } })).toBe(30);
    const boundaryId = randomUUID();
    const boundaryAnswers = answers.map((answer, i) => i < 8 ? answer : { ...answer, optionId: quiz.questions[i].options.find(o => !o.isCorrect)!.id });
    expect((await submitQuiz({ quizId: quiz.slug, requestId: boundaryId, answers: boundaryAnswers })).error).toBeUndefined();
    expect(await db.quizAttempt.findUniqueOrThrow({ where: { id: boundaryId }, select: { score: true, passed: true } })).toEqual({ score: 80, passed: true });
    const failureId = randomUUID();
    expect((await submitQuiz({ quizId: quiz.slug, requestId: failureId, answers: answers.map((answer, i) => ({ ...answer, optionId: quiz.questions[i].options.find(o => !o.isCorrect)!.id })) })).error).toBeUndefined();
    expect(await db.quizAttempt.findUniqueOrThrow({ where: { id: failureId }, select: { score: true, passed: true } })).toEqual({ score: 0, passed: false });
    expect((await courseState(userId, course.slug))?.complete).toBe(true);
    expect((await db.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId, courseId } } })).completedAt?.getTime()).toBe(completion.completedAt?.getTime());
    expect(await db.quizAnswer.count({ where: { attempt: { userId } } })).toBe(50);
    await timed("profile.admin-lessons", () => adminLessons());
  } finally {
    await db.quizAnswer.deleteMany({ where: { attempt: { userId } } });
    await db.quizAttempt.deleteMany({ where: { userId } });
    await db.userBadge.deleteMany({ where: { userId } });
    await db.enrollment.deleteMany({ where: { userId } });
    await db.course.deleteMany({ where: { id: courseId } });
    await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  }
}, 180000);
