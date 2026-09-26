import QuizHeader from "@/components/quiz/QuizHeader";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import "@/styles/quiz/quiz-page.css";

export default function QuizPage() {
  return (
    <main className="quiz-page">
      <div className="quiz-container">
        <QuizHeader />
        <QuizQuestion />
      </div>
    </main>
  );
}
