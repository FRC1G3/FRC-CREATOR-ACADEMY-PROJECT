import { FileQuestion } from "lucide-react";
import { quizPreview } from "@/data/quiz-data";

export default function QuizHeader() {
  return (
    <header className="quiz-heading">
      <div className="quiz-heading-icon"><FileQuestion size={38} aria-hidden="true" /></div>
      <div>
        <span className="quiz-eyebrow">CHECKPOINT QUIZ</span>
        <h1>{quizPreview.title}</h1>
        <p className="quiz-module">{quizPreview.module}</p>
        <p className="quiz-intro">{quizPreview.description}</p>
      </div>
    </header>
  );
}
