import { FileText, ChevronUp, ChevronRight, Check, Play, LockKeyhole, TvMinimalPlay } from "lucide-react";
import { moduleLessons, upcomingLessonModules, lessonPreview } from "@/data/lesson-data";

export default function ModuleLessons() {
  return (
    <div className="lesson-modules">
      <section className="lesson-module app-card" aria-label="Module 2 lessons">
        <div className="lesson-module-heading">
          <span className="lesson-module-icon"><FileText /></span>
          <div><h2>Module 2</h2><p>{lessonPreview.module}</p></div>
          <span className="lesson-module-count">3 / 5 completed</span><ChevronUp aria-hidden="true" />
        </div>
        <ol className="lesson-module-list">
          {moduleLessons.map((lesson, index) => (
            <li key={lesson.title} className={lesson.status} aria-current={lesson.status === "current" ? "step" : undefined} aria-label={`${lesson.title}, ${lesson.status}`}>
              <span className="lesson-row-icon" aria-hidden="true">{lesson.status === "completed" ? <Check /> : lesson.status === "current" ? <Play fill="currentColor" /> : index + 1}</span>
              <span className="lesson-row-number">{index + 1}</span>
              <span className="lesson-row-title">{lesson.title}</span>
              <span className="lesson-row-duration">{lesson.duration}</span>
              {lesson.status === "locked" ? <LockKeyhole aria-hidden="true" /> : <TvMinimalPlay aria-hidden="true" />}
            </li>
          ))}
        </ol>
        <div className="lesson-checkpoint" aria-label="Checkpoint Quiz, locked">
          <span className="lesson-module-icon"><FileText /></span>
          <div><h3>Checkpoint Quiz</h3><p>Complete the last 3 lessons to unlock</p></div><LockKeyhole />
        </div>
      </section>
      {upcomingLessonModules.map((module) => (
        <section className="lesson-module-collapsed app-card" key={module.number}>
          <span className="lesson-module-icon"><FileText /></span>
          <div><h2>Module {module.number}</h2><p>{module.title}</p></div>
          <span className="lesson-module-count">0 / 4 completed</span><ChevronRight aria-hidden="true" />
        </section>
      ))}
    </div>
  );
}
