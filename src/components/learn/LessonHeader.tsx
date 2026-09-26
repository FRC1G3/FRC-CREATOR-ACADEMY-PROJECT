import { Layers, Clock3, Circle, Download } from "lucide-react";
import type { LessonView } from "@/types/learning";

export default function LessonHeader({ lessonPreview, children }: { lessonPreview: LessonView; children: React.ReactNode }) {
  return (
    <section className="lesson-header">
      <span className="lesson-eyebrow">LESSON {lessonPreview.number}</span>
      <h1>{lessonPreview.title}</h1>
      <div className="lesson-meta">
        <span><Layers />Module {lessonPreview.moduleNumber} <span>·</span> {lessonPreview.module}</span>
        <span><Clock3 />{lessonPreview.duration}</span>
        <span className="lesson-status"><Circle />{lessonPreview.status}</span>
      </div>
      <p>{lessonPreview.description}</p>
      <div className="lesson-actions">
        {children}
        <button type="button" disabled className="lesson-notes"><Download />Download Notes</button>
      </div>
    </section>
  );
}
