import { Flame, Trophy, ChartNoAxesColumnIncreasing } from "lucide-react";
import type { LessonView } from "@/types/learning";

export default function CourseProgressCard({ lessonPreview }: { lessonPreview: LessonView }) {
  return (
    <section className="lesson-course-progress app-card">
      <h2>Course Progress</h2>
      <div className="lesson-progress-numbers"><strong>{lessonPreview.progress}%</strong><p><b>{lessonPreview.completed}</b><span>Lessons Completed</span></p></div>
      <progress value={lessonPreview.progress} max={100} aria-label="Course completion" />
      <div className="lesson-progress-stats">
        <div><Flame /><p><b>{lessonPreview.streak}</b><span>Day Streak</span></p></div>
        <div><Trophy /><p><b>{lessonPreview.quizzes}</b><span>Quizzes Passed</span></p></div>
        <div><ChartNoAxesColumnIncreasing /><p>{lessonPreview.course}</p></div>
      </div>
    </section>
  );
}
