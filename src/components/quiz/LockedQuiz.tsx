import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function LockedQuiz({ courseSlug }: { courseSlug?: string }) {
  return <main className="quiz-page"><section className="quiz-locked app-card">
    <span className="quiz-locked-icon"><LockKeyhole size={32} /></span>
    <h1>Quiz Locked</h1>
    <p>Complete the previous roadmap steps to unlock this checkpoint.</p>
    <div><Link className="student-primary" href={courseSlug ? `/roadmap?course=${encodeURIComponent(courseSlug)}` : "/roadmap"}>View Roadmap</Link>
      <Link href={courseSlug ? `/courses/${encodeURIComponent(courseSlug)}` : "/courses"}>Back to Course</Link></div>
  </section></main>;
}
