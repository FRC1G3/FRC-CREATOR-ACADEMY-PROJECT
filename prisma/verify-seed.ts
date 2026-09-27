import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { getPrisma } from "../src/lib/prisma";
import { seedModules, seedBadges } from "./seed-data";

async function verify() {
  const db = getPrisma();
  try {
    const admin = await db.user.findUnique({ where: { email: "admin@frc.academy" }, select: { id: true, role: true } });
    const student = await db.user.findUnique({ where: { email: "student@frc.academy" }, select: { id: true, role: true } });
    const course = await db.course.findUnique({ where: { slug: "youtube" }, select: { id: true, title: true } });
    if (!admin || admin.role !== "ADMIN" || !student || student.role !== "STUDENT" || !course || course.title !== "YouTube Creator Mastery") throw new Error("Seed identities missing or mismatched.");
    const [modules, lessons, quizzes, badges, nodes, enrollment, progress, attempts, answers, awards, accounts] = await Promise.all([
      db.module.findMany({ where: { courseId: course.id }, orderBy: { order: "asc" } }),
      db.lesson.findMany({ where: { slug: { in: seedModules.flatMap(m => m.lessons.map(l => l.slug)) }, module: { courseId: course.id } }, orderBy: { id: "asc" } }),
      db.quiz.findMany({ where: { courseId: course.id, slug: { in: seedModules.map(m => m.quizSlug) } }, include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } }, orderBy: { id: "asc" } }),
      db.badge.findMany({ where: { slug: { in: seedBadges.map(b => b.slug) } }, orderBy: { id: "asc" } }),
      db.roadmapNode.findMany({ where: { courseId: course.id }, orderBy: { order: "asc" } }),
      db.enrollment.findUnique({ where: { userId_courseId: { userId: student.id, courseId: course.id } } }),
      db.lessonProgress.findMany({ where: { userId: student.id, lesson: { module: { courseId: course.id } } }, orderBy: { id: "asc" } }),
      db.quizAttempt.findMany({ where: { id: "seed-student-fundamentals-attempt-1", userId: student.id }, orderBy: { id: "asc" } }),
      db.quizAnswer.findMany({ where: { attemptId: "seed-student-fundamentals-attempt-1" }, orderBy: { id: "asc" } }),
      db.userBadge.findMany({ where: { userId: student.id, badge: { slug: "creator-starter" } }, orderBy: { id: "asc" } }),
      db.account.count({ where: { userId: { in: [admin.id, student.id] }, providerId: "credential", password: { not: null } } }),
    ]);
    const counts = { User: 2, Course: 1, Module: modules.length, Lesson: lessons.length, Enrollment: enrollment ? 1 : 0, LessonProgress: progress.length, Quiz: quizzes.length, Question: quizzes.reduce((n,q) => n+q.questions.length,0), AnswerOption: quizzes.reduce((n,q) => n+q.questions.reduce((sum,question) => sum+question.options.length,0),0), QuizAttempt: attempts.length, QuizAnswer: answers.length, Badge: badges.length, UserBadge: awards.length, RoadmapNode: nodes.length, Account: accounts };
    const expected = { User:2, Course:1, Module:6, Lesson:18, Enrollment:1, LessonProgress:4, Quiz:6, Question:18, AnswerOption:72, QuizAttempt:1, QuizAnswer:3, Badge:4, UserBadge:1, RoadmapNode:26, Account:2 };
    for (const key of Object.keys(expected) as (keyof typeof expected)[]) if (counts[key] < expected[key]) throw new Error(`Insufficient ${key} records.`);
    if (quizzes.some(q => q.questions.length !== 3 || q.questions.some(question => question.options.length !== 4 || question.options.filter(o => o.isCorrect).length !== 1))) throw new Error("Invalid seeded quiz content.");
    const fixtureQuiz = quizzes.find(q => q.slug === seedModules[0].quizSlug);
    if (!fixtureQuiz || attempts[0].quizId !== fixtureQuiz.id || answers.some(answer => !fixtureQuiz.questions.some(question => question.id === answer.questionId && question.options.some(option => option.id === answer.selectedOptionId)))) throw new Error("Invalid seeded attempt relationships.");
    const fingerprint = createHash("sha256").update(JSON.stringify({admin,student,course,modules,lessons,quizzes,badges,nodes,enrollment,progress,attempts,answers,awards,accounts})).digest("hex");
    const snapshot = { counts, fingerprint };
    if (process.argv.includes("--snapshot")) writeFileSync(".seed-verification.json", JSON.stringify(snapshot));
    if (process.argv.includes("--compare")) {
      const before = JSON.parse(readFileSync(".seed-verification.json", "utf8"));
      if (JSON.stringify(before) !== JSON.stringify(snapshot)) throw new Error("Seed records changed between runs.");
      console.log("Idempotency verified: counts, record identities, content and student history unchanged.");
    }
    console.log("Seed-scoped verification counts:", JSON.stringify(counts));
  } finally { await db.$disconnect(); }
}
verify().catch(() => { console.error("Seed verification failed. Check expected fixture records; connection details are not logged."); process.exitCode = 1; });
