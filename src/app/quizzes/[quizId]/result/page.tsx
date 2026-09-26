import QuizResult from "@/components/quiz/QuizResult";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import Link from "next/link";
import "@/styles/quiz/quiz-result.css";

export default async function QuizResultPage({ params, searchParams }: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { quizId } = await params;
  const user = await requireUser(`/quizzes/${quizId}/result`);
  const { attempt: attemptId } = await searchParams;
  const attempt = await getPrisma().quizAttempt.findFirst({ where: { userId: user.id, ...(attemptId ? { id: attemptId } : {}), completedAt: { not: null }, quiz: { slug: quizId, status: "PUBLISHED", course: { status: "PUBLISHED" } } }, orderBy: { completedAt: "desc" }, include: { quiz: { select: { passScore: true, course: { select: { slug: true, title: true } }, module: { select: { title: true } } } }, answers: { include: { question: { include: { options: { where: { isCorrect: true }, select: { text: true } } } }, selectedOption: { select: { text: true } } } } } });
  if (!attempt) {
    if (attemptId) notFound();
    const quiz = await getPrisma().quiz.findFirst({ where: { slug: quizId, status: "PUBLISHED", course: { status: "PUBLISHED", enrollments: { some: { userId: user.id } } } }, select: { id: true } });
    if (!quiz) notFound();
    return <main className="quiz-result-page"><section className="quiz-result-container app-card learning-empty"><h1>No completed attempt yet</h1><Link href={`/quizzes/${quizId}`}>Open checkpoint quiz</Link></section></main>;
  }
  const result = { score: attempt.score ?? 0, passed: attempt.passed === true, correct: attempt.answers.filter(a => a.isCorrect).length, total: attempt.answers.length, time: "Not tracked", requirement: attempt.quiz.passScore, courseSlug: attempt.quiz.course.slug, courseTitle: attempt.quiz.course.title, moduleTitle: attempt.quiz.module?.title ?? "Checkpoint" };
  return <><QuizResult result={result} quizId={quizId} /><section id="answer-review" className="quiz-container app-card learning-review"><h2>Answer Review</h2>{attempt.answers.map(answer => <article key={answer.id}><h3>{answer.question.text}</h3><p>Your answer: {answer.selectedOption.text} — {answer.isCorrect ? "Correct" : "Incorrect"}</p><p>Correct answer: {answer.question.options.map(o => o.text).join(", ")}</p><p>{answer.question.explanation}</p></article>)}</section></>;
}
