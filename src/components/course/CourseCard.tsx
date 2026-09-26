import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, LockKeyhole, Smartphone, Clapperboard, NotebookPen, TrendingUp, Wrench } from "lucide-react";
import type { courses } from "@/data/mock-data";
import "@/styles/courses/course-card.css";

type CourseCardProps = { course: (typeof courses)[number] };

const thumbnailIcons = {
  shorts: Smartphone,
  editing: Clapperboard,
  strategy: NotebookPen,
  monetization: TrendingUp,
  tools: Wrench,
};

export default function CourseCard({ course }: CourseCardProps) {
  const isActive = course.progress !== null;
  const ThumbnailIcon = thumbnailIcons[course.id as keyof typeof thumbnailIcons] ?? BookOpen;

  return (
    <article className={`course-card app-card ${isActive ? "active" : "locked"}`}>
      <div className="course-thumbnail">
        {course.image ? (
          <>
            <Image src={course.image} alt="Red YouTube creator studio" fill loading={isActive ? "eager" : "lazy"} sizes="(max-width: 600px) 95vw, (max-width: 1000px) 46vw, 31vw" />
            <span className="course-thumbnail-title">YouTube<br />Creator Mastery</span>
          </>
        ) : (
          <div className={`course-placeholder ${course.id}`} aria-hidden="true"><ThumbnailIcon strokeWidth={1} /></div>
        )}
        {!isActive && <span className="course-lock" aria-label="Course not available yet"><LockKeyhole size={23} /></span>}
      </div>
      <div className="course-content">
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <div className="course-meta">
          <span><BookOpen size={14} />{course.lessons} Lessons</span>
          <span><ChartNoAxesColumnIncreasing size={14} />{course.level}</span>
        </div>
        {isActive && (
          <div className="course-progress">
            <progress value={course.progress ?? 0} max={100} aria-label={`${course.title} progress`} />
            <span>{course.progress}%</span>
          </div>
        )}
        {isActive ? (
          <Link className="course-button" href={`/courses/${course.id}`}>
            Continue Learning <ArrowRight size={17} />
          </Link>
        ) : (
          <button className="course-button" type="button" disabled>Coming Soon</button>
        )}
      </div>
    </article>
  );
}
