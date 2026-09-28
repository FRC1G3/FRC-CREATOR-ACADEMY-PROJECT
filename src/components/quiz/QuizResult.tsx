import Link from "next/link";
import { Trophy, X, CircleCheck, CircleX, Clock3, ChartNoAxesColumnIncreasing, LockKeyholeOpen, BookOpen, ArrowRight, RotateCw, ChevronRight, House } from "lucide-react";
import type { ResultView } from "@/types/learning";

type QuizResultProps = { result: ResultView; quizId: string };

export default function QuizResult({ result, quizId }: QuizResultProps) {
  const passed = result.passed;
  const quizPassRequirement = result.requirement;
  const quizUrl = `/quizzes/${encodeURIComponent(quizId)}`;
  return (
    <main className={`quiz-result-page ${passed ? "passed" : "failed"}`}>
      <div className="quiz-result-container">
        <div className="quiz-result-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" aria-label="Home"><House size={15} /></Link>
          <Link href="/courses">Courses</Link><ChevronRight />
          <Link href={`/courses/${result.courseSlug}`}>{result.courseTitle}</Link><ChevronRight />
          <span>{result.moduleTitle}</span><ChevronRight /><Link href={quizUrl}>Checkpoint Quiz</Link>
        </div>
        <section className="quiz-result-hero" aria-labelledby="quiz-result-title">
          <div className="quiz-result-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ left: `${5 + ((index * 37) % 90)}%`, top: `${8 + ((index * 19) % 83)}%`, transform: `rotate(${index * 29}deg)` }} />)}</div>
          <div className="quiz-result-emblem" aria-hidden="true">{passed ? <Trophy /> : <X />}</div>
          <span className="quiz-result-status">{passed ? <CircleCheck /> : <CircleX />}{passed ? "Quiz Passed!" : "Quiz Not Passed"}</span>
          <strong className="quiz-result-score">{result.score}%</strong>
          <h1 id="quiz-result-title">{passed ? "Great Job!" : "Almost There!"}</h1>
          <p>{passed ? "You’ve passed the checkpoint quiz and unlocked the next stage." : `You need at least ${quizPassRequirement}% to pass this quiz. Review the lessons and try again.`}</p>
        </section>
        <div className="quiz-result-stats">
          <div className="app-card">{passed ? <CircleCheck /> : <CircleX />}<p><strong>{result.correct} / {result.total}</strong><span>Correct Answers</span></p></div>
          <div className="app-card"><Clock3 /><p><strong>{result.time}</strong><span>Time Taken</span></p></div>
          <div className="app-card">{passed ? <ChartNoAxesColumnIncreasing /> : <Trophy />}<p><strong>{quizPassRequirement}%</strong><span>Pass Requirement</span></p></div>
        </div>
        <div className="quiz-result-recommendation app-card">
          <span>{passed ? <LockKeyholeOpen /> : <BookOpen />}</span>
          <div><h2>{passed ? "Next Stage Unlocked" : "Review Recommended Lessons"}</h2><p>{passed ? "Continue along your learning roadmap." : "We recommend reviewing the key lessons from this module before trying again."}</p></div>
        </div>
        <div className="student-result-links"><Link href={`/courses/${result.courseSlug}`}>Back to Course</Link><Link href={`/roadmap?course=${result.courseSlug}`}>View Roadmap</Link></div>
        <div className="quiz-result-actions">
          {passed ? <a href="#answer-review"><RotateCw />Review Answers</a> : <Link href={`/courses/${result.courseSlug}`}><BookOpen />Review Lessons</Link>}
          <Link className="quiz-result-primary" href={passed ? `/roadmap?course=${result.courseSlug}` : quizUrl}>{passed ? <>Continue to Next Stage <ArrowRight /></> : <><RotateCw />Retry Quiz</>}</Link>
        </div>
      </div>
    </main>
  );
}
