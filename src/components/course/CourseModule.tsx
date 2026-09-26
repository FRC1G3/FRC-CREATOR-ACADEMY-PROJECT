import { Check, ChevronDown, ChevronUp, FileText, LockKeyhole, Play, TvMinimalPlay } from "lucide-react";
import Link from "next/link";
import type { ModuleView } from "@/types/learning";

type CourseModuleProps = { module: ModuleView };

export default function CourseModule({ module }: CourseModuleProps) {
  const isExpanded = module.lessons.length > 0;
  return (
    <article className="course-module app-card">
      <div className="course-module-header">
        <span className="course-module-number" aria-label={`Module ${module.number}`}>{module.number}</span>
        <div className="course-module-title">
          <h3>{module.title}</h3>
          <p>{module.lessonCount} lessons</p>
        </div>
        <span className={`course-module-percent ${module.progress === 100 ? "completed" : ""}`}>{module.progress}%</span>
        {isExpanded ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
      </div>
      {isExpanded && (
        <ul className="course-lesson-list">
          {module.lessons.map((lesson) => (
            <li key={lesson.title} className={`course-lesson-row ${lesson.status}`} aria-current={lesson.status === "current" ? "step" : undefined}>
              <span className="course-lesson-status" aria-label={lesson.status}>
                {lesson.status === "completed" && <Check size={13} />}
                {lesson.status === "current" && <Play size={12} fill="currentColor" />}
                {lesson.status === "locked" && <LockKeyhole size={18} />}
                {lesson.status === "quiz" && <FileText size={18} />}
              </span>
              <span className="course-lesson-title">{lesson.href ? <Link href={lesson.href}>{lesson.title}</Link> : lesson.title}</span>
              <span className="course-lesson-duration">{lesson.duration}</span>
              {lesson.status === "quiz" ? <span className="course-lesson-action">--</span> : <TvMinimalPlay size={17} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
