import BookmarkButton from "@/components/learning/BookmarkButton";
import DatabaseImage from "@/components/learning/DatabaseImage";
import Link from "next/link";
import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, LockKeyhole } from "lucide-react";
import type { CourseCardView } from "@/types/learning";
import "@/styles/courses/course-card.css";

type CourseCardProps = { course: CourseCardView };

export default function CourseCard({ course }: CourseCardProps) {
  const isActive = true;

  return (
    <article className={`course-card app-card ${isActive ? "active" : "locked"}`}>
      <div className="course-thumbnail">
        <DatabaseImage src={course.image} alt="" fill loading="lazy" sizes="(max-width: 600px) 95vw, (max-width: 1000px) 46vw, 31vw" />
        <span className="course-thumbnail-title">{course.title}</span>
        {!isActive && <span className="course-lock" aria-label="Course not available yet"><LockKeyhole size={23} /></span>}
      </div>
      {course.bookmark && <BookmarkButton kind="course" id={course.bookmark.id} initialSaved={course.bookmark.saved} />}
      <div className="course-content">
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <div className="course-meta">
          <span><BookOpen size={14} />{course.lessons} Lessons</span>
          <span><ChartNoAxesColumnIncreasing size={14} />{course.level}</span>
          {course.duration != null && <span>{course.duration} min</span>}
        </div>
        {course.progress !== null && (
          <div className="course-progress">
            <progress value={course.progress ?? 0} max={100} aria-label={`${course.title} progress`} />
            <span>{course.progress ?? 0}%</span>
          </div>
        )}
        {isActive ? (
          <Link className="course-button" href={`/courses/${course.id}`} aria-label={`View ${course.title}`}>
            View Course <ArrowRight size={17} />
          </Link>
        ) : (
          <button className="course-button" type="button" disabled>Coming Soon</button>
        )}
      </div>
    </article>
  );
}
