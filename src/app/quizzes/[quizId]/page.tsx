import QuizHeader from "@/components/quiz/QuizHeader";
import { notFound } from "next/navigation";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import "@/styles/quiz/quiz-page.css";

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  if (quizId !== "content-strategy") notFound();
  return (
    <main className="quiz-page">
      <div className="quiz-container">
        <QuizHeader />
        <QuizQuestion />
      </div>
    </main>
  );
}
