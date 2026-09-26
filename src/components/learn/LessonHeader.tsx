import { Layers, Clock3, Circle, CircleCheck, ArrowRight, Download } from "lucide-react";
import { lessonPreview } from "@/data/lesson-data";

export default function LessonHeader() {
  return (
    <section className="lesson-header">
      <span className="lesson-eyebrow">LESSON {lessonPreview.number}</span>
      <h1>{lessonPreview.title}</h1>
      <div className="lesson-meta">
        <span><Layers />Module 2 <span>·</span> {lessonPreview.module}</span>
        <span><Clock3 />{lessonPreview.duration}</span>
        <span className="lesson-status"><Circle />In Progress</span>
      </div>
      <p>{lessonPreview.description}</p>
      <div className="lesson-actions">
        <button type="button" disabled className="lesson-complete"><CircleCheck />Mark as Complete</button>
        <button type="button" disabled>Next Lesson <ArrowRight /></button>
        <button type="button" disabled className="lesson-notes"><Download />Download Notes</button>
      </div>
    </section>
  );
}
