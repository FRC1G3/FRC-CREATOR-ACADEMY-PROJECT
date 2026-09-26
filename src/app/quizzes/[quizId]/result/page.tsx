import QuizResult from "@/components/quiz/QuizResult";
import { notFound } from "next/navigation";
import { quizResultPreviews } from "@/data/quiz-result-data";
import "@/styles/quiz/quiz-result.css";

export default async function QuizResultPage({ params, searchParams }: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ preview?: string | string[] }>;
}) {
  const { quizId } = await params;
  if (quizId !== "content-strategy") notFound();
  const { preview } = await searchParams;
  const result = preview === "failed" ? quizResultPreviews.failed : quizResultPreviews.passed;
  return <QuizResult result={result} quizId={quizId} />;
}
