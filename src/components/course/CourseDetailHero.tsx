import { ChartNoAxesColumnIncreasing, Clapperboard, TvMinimalPlay } from "lucide-react";

export default function CourseDetailHero({ title, description, lessons, modules, level, instructor, children, bookmark }: { title: string; description: string; lessons: number; modules: number; level: string; instructor: string; children: React.ReactNode; bookmark?: React.ReactNode }) {
  return (
    <section className="course-detail-hero app-card">
      <div className="course-detail-hero-content">
        <span className="section-eyebrow">COURSE</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="course-detail-meta">
          <span><TvMinimalPlay size={17} aria-hidden="true" />{lessons} Lessons</span>
          <span><Clapperboard size={17} aria-hidden="true" />{modules} Modules</span>
          <span><ChartNoAxesColumnIncreasing size={17} aria-hidden="true" />{level}</span>
        </div>
        <p className="course-detail-instructor">Instructor <strong>{instructor}</strong></p>
        <div className="course-detail-actions">
          {children}
          {bookmark}
        </div>
      </div>
    </section>
  );
}
