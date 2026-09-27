import { BookOpen, Layers } from "lucide-react";

export default function CourseProgress({ progress, completed, total, modules, totalModules }: { progress: number; completed: number; total: number; modules: number; totalModules: number }) {
  return (
    <section className="course-detail-progress app-card" aria-labelledby="course-progress-title">
      <div className="course-detail-progress-heading"><h2 id="course-progress-title">Your Progress</h2></div>
      <strong>{progress}%</strong>
      <progress value={progress} max={100} aria-label="Course progress" />
      <div className="course-detail-stats">
        <div><BookOpen size={25} aria-hidden="true" /><p><b>{completed} / {total}</b><span>Lessons</span></p></div>
        <div><Layers size={25} aria-hidden="true" /><p><b>{modules} / {totalModules}</b><span>Modules</span></p></div>
      </div>
    </section>
  );
}
