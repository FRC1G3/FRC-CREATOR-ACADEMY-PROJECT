import { timed } from "@/lib/performance";
import { CircleCheck, CircleX } from "lucide-react";
import QuizResult from "@/components/quiz/QuizResult";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/current-user";
import { quizResultInclude } from "@/services/quiz-results";
import { getPrisma } from "@/lib/prisma";
import Link from "next/link";
import "@/styles/quiz/quiz-result.css";

async function QuizResultPage({ params, searchParams }: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { quizId } = await params;
  const user = await requireUser(`/quizzes/${quizId}/result`);
  const { attempt: attemptId } = await searchParams;
  const attempt = await getPrisma().quizAttempt.findFirst({ where: { userId: user.id, ...(attemptId ? { id: attemptId } : {}), completedAt: { not: null }, quiz: { slug: quizId, status: "PUBLISHED", course: { status: "PUBLISHED" } } }, orderBy: { completedAt: "desc" }, include: quizResultInclude });
  if (!attempt) {
    if (attemptId) notFound();
    const quiz = await getPrisma().quiz.findFirst({ where: { slug: quizId, status: "PUBLISHED", course: { status: "PUBLISHED", enrollments: { some: { userId: user.id } } } }, select: { id: true } });
    if (!quiz) notFound();
    return <main className="quiz-result-page"><section className="quiz-result-container app-card learning-empty"><h1>No completed attempt yet</h1><Link href={`/quizzes/${quizId}`}>Open checkpoint quiz</Link></section></main>;
  }
  const result = { score: attempt.score ?? 0, passed: attempt.passed === true, correct: attempt.answers.filter(a => a.isCorrect).length, total: attempt.answers.length, time: "Not tracked", requirement: attempt.quiz.passScore, courseSlug: attempt.quiz.course.slug, courseTitle: attempt.quiz.course.title, moduleTitle: attempt.quiz.module?.title ?? "Checkpoint" };
  return <><QuizResult result={result} quizId={quizId} /><section id="answer-review" className="quiz-container app-card learning-review"><h2>Answer Review</h2>{attempt.answers.map(answer => <article key={answer.id} className={answer.isCorrect ? "review-correct" : "review-incorrect"}><span className="review-status">{answer.isCorrect ? <CircleCheck size={18} /> : <CircleX size={18} />}{answer.isCorrect ? "Correct" : "Incorrect"}</span><h3>{answer.question.text}</h3><p><strong>Your answer</strong>{answer.selectedOption.text}</p><p><strong>Correct answer</strong>{answer.question.options.map(o => o.text).join(", ")}</p>{answer.question.explanation && <p className="review-explanation"><strong>Explanation</strong>{answer.question.explanation}</p>}</article>)}</section></>;
}

export default async function ProfiledPage(...args: Parameters<typeof QuizResultPage>) {
  return timed("route.result", () => QuizResultPage(...args));
}
