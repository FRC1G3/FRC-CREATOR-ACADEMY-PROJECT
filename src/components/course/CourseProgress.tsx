import { BookOpen, ChevronRight, Layers } from "lucide-react";

export default function CourseProgress() {
  return (
    <section className="course-detail-progress app-card" aria-labelledby="course-progress-title">
      <div className="course-detail-progress-heading"><h2 id="course-progress-title">Your Progress</h2><ChevronRight size={17} aria-hidden="true" /></div>
      <strong>68%</strong>
      <progress value={68} max={100} aria-label="Course progress" />
      <div className="course-detail-stats">
        <div><BookOpen size={25} aria-hidden="true" /><p><b>29 / 42</b><span>Lessons</span></p></div>
        <div><Layers size={25} aria-hidden="true" /><p><b>3 / 6</b><span>Modules</span></p></div>
      </div>
    </section>
  );
}
