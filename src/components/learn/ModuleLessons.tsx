import { FileText, ChevronUp, ChevronRight, Check, Play, LockKeyhole, TvMinimalPlay } from "lucide-react";
import Link from "next/link";
import type { ModuleView } from "@/types/learning";

export default function ModuleLessons({ modules, current }: { modules: ModuleView[]; current: number }) {
  const active = modules.find(m => m.number === current)!;
  const moduleLessons = active.lessons.filter(l => !l.duration.endsWith("questions"));
  const quizzes = active.lessons.filter(l => l.duration.endsWith("questions"));
  const upcomingLessonModules = modules.filter(m => m.number !== current);
  return (
    <div className="lesson-modules">
      <section className="lesson-module app-card" aria-label={`Module ${current} lessons`}>
        <div className="lesson-module-heading">
          <span className="lesson-module-icon"><FileText /></span>
          <div><h2>Module {current}</h2><p>{active.title}</p></div>
          <span className="lesson-module-count">{moduleLessons.filter(l => l.status === "completed").length} / {moduleLessons.length} completed</span><ChevronUp aria-hidden="true" />
        </div>
        <ol className="lesson-module-list">
          {moduleLessons.map((lesson, index) => (
            <li key={lesson.title} className={lesson.status} aria-current={lesson.status === "current" ? "step" : undefined} aria-label={`${lesson.title}, ${lesson.status}`}>
              <span className="lesson-row-icon" aria-hidden="true">{lesson.status === "completed" ? <Check /> : lesson.status === "current" ? <Play fill="currentColor" /> : index + 1}</span>
              <span className="lesson-row-number">{index + 1}</span>
              <span className="lesson-row-title">{lesson.href ? <Link href={lesson.href}>{lesson.title}</Link> : lesson.title}</span>
              <span className="lesson-row-duration">{lesson.duration}</span>
              {lesson.status === "locked" ? <LockKeyhole aria-hidden="true" /> : <TvMinimalPlay aria-hidden="true" />}
            </li>
          ))}
        </ol>
        {quizzes.map(quiz => <div key={quiz.title} className="lesson-checkpoint" aria-label={quiz.title}>
          <span className="lesson-module-icon"><FileText /></span>
          <div><h3>{quiz.href ? <Link href={quiz.href}>{quiz.title}</Link> : quiz.title}</h3><p>{quiz.href ? "Open checkpoint" : "Complete earlier lessons to unlock"}</p></div>{!quiz.href && <LockKeyhole />}
        </div>)}
      </section>
      {upcomingLessonModules.map((module) => (
        <section className="lesson-module-collapsed app-card" key={module.number}>
          <span className="lesson-module-icon"><FileText /></span>
          <div><h2>Module {module.number}</h2><p>{module.title}</p></div>
          <span className="lesson-module-count">{module.progress}% completed</span><ChevronRight aria-hidden="true" />
        </section>
      ))}
    </div>
  );
}
