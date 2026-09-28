import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function LockedLesson({ courseSlug }: { courseSlug?: string }) {
  return <main className="lesson-page"><section className="lesson-locked app-card">
    <span className="lesson-locked-icon"><LockKeyhole size={32} /></span>
    <h1>Lesson Locked</h1>
    <p>Complete the previous roadmap steps to unlock this lesson.</p>
    <div><Link className="student-primary" href={courseSlug ? `/roadmap?course=${encodeURIComponent(courseSlug)}` : "/roadmap"}>View Roadmap</Link>
      <Link href={courseSlug ? `/courses/${encodeURIComponent(courseSlug)}` : "/courses"}>Back to Course</Link></div>
  </section></main>;
}
