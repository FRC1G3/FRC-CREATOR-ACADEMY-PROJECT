import { ArrowLeft, ArrowRight, Check, Lightbulb } from "lucide-react";
import { quizPreview } from "@/data/quiz-data";

export default function QuizQuestion() {
  return (
    <section className="quiz-question app-card" aria-labelledby="quiz-question-title">
      <div className="quiz-question-progress">
        <div><span>Question {quizPreview.currentQuestion} of {quizPreview.totalQuestions}</span><span>{quizPreview.progress}%</span></div>
        <progress value={quizPreview.progress} max={100} aria-label="Question progress" />
      </div>
      <h2 id="quiz-question-title">{quizPreview.question}</h2>
      <div className="quiz-options" role="group" aria-labelledby="quiz-question-title">
        {quizPreview.options.map((option) => {
          const selected = option.letter === quizPreview.selectedOption;
          return (
            <button key={option.letter} type="button" className={`quiz-option${selected ? " selected" : ""}`} aria-pressed={selected} aria-disabled="true">
              <span className="quiz-option-letter">{option.letter}</span>
              <span className="quiz-option-text">{option.text}</span>
              {selected && <Check className="quiz-option-check" size={20} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className="quiz-hint"><Lightbulb size={28} aria-hidden="true" /><p>{quizPreview.hint}</p></div>
      <div className="quiz-navigation">
        <button type="button" className="quiz-previous" aria-disabled="true"><ArrowLeft size={17} />Previous Question</button>
        <button type="button" className="quiz-next" aria-disabled="true">Next Question <ArrowRight size={17} /></button>
      </div>
    </section>
  );
}
