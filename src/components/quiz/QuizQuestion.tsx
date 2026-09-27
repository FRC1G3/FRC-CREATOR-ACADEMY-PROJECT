"use client";
import { ArrowLeft, ArrowRight, Check, Lightbulb } from "lucide-react";
import { submitQuiz } from "@/actions/learning";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PublicQuiz } from "@/types/learning";

export default function QuizQuestion({ quiz }: { quiz: PublicQuiz }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const submitting = useRef(false);
  const question = quiz.questions[index];
  if (!question) return <section className="quiz-question app-card"><p>No questions are available yet.</p></section>;
  const quizPreview = { currentQuestion: index + 1, totalQuestions: quiz.questions.length, progress: Math.round((index + 1) / quiz.questions.length * 100), question: question.text, options: question.options.map((o, i) => ({ ...o, letter: String.fromCharCode(65 + i) })), selectedOption: answers[question.id], hint: "Choose the answer that best matches what you learned." };
  function submit() {
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    const token = requestId || crypto.randomUUID();
    setRequestId(token);
    startTransition(async () => {
      try {
        const result = await submitQuiz({ quizId: quiz.id, requestId: token, answers: quiz.questions.map(q => ({ questionId: q.id, optionId: answers[q.id] })) });
        if (result.url) router.push(result.url);
        else { submitting.current = false; setError(result.error ?? "Please try again."); }
      } catch { submitting.current = false; setError("Unable to submit. Please try again."); }
    });
  }
  return (
    <section className="quiz-question app-card" aria-labelledby="quiz-question-title">
      <div className="quiz-question-progress">
        <div><span>Question {quizPreview.currentQuestion} of {quizPreview.totalQuestions}</span><span>{quizPreview.progress}%</span></div>
        <progress value={quizPreview.progress} max={100} aria-label="Question progress" />
      </div>
      <h2 key={question.id} id="quiz-question-title">{quizPreview.question}</h2>
      <div className="quiz-options" role="group" aria-labelledby="quiz-question-title">
        {quizPreview.options.map((option) => {
          const selected = option.id === quizPreview.selectedOption;
          return (
            <button key={option.id} disabled={pending} onClick={() => setAnswers({ ...answers, [question.id]: option.id })} type="button" className={`quiz-option${selected ? " selected" : ""}`} aria-pressed={selected}>
              <span className="quiz-option-letter">{option.letter}</span>
              <span className="quiz-option-text">{option.text}</span>
              {selected && <Check className="quiz-option-check" size={20} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className="quiz-hint"><Lightbulb size={28} aria-hidden="true" /><p>{quizPreview.hint}</p></div>
      <div className="quiz-navigation">
        <button type="button" className="quiz-previous" disabled={pending || index === 0} onClick={() => setIndex(index - 1)}><ArrowLeft size={17} />Previous Question</button>
        <button type="button" className="quiz-next" disabled={pending || !answers[question.id]} onClick={() => index === quiz.questions.length - 1 ? submit() : setIndex(index + 1)}>{pending ? "Submitting..." : index === quiz.questions.length - 1 ? "Submit Quiz" : "Next Question"} <ArrowRight size={17} /></button>
      </div>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
