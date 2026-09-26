import Link from "next/link";
import { ArrowRight, Bookmark, ChartNoAxesColumnIncreasing, Clapperboard, TvMinimalPlay } from "lucide-react";

export default function CourseDetailHero() {
  return (
    <section className="course-detail-hero app-card">
      <div className="course-detail-hero-content">
        <span className="section-eyebrow">COURSE</span>
        <h1>YouTube Creator Mastery</h1>
        <p>Learn everything you need to build, grow and monetize<br />your YouTube channel from zero to professional.</p>
        <div className="course-detail-meta">
          <span><TvMinimalPlay size={17} aria-hidden="true" />42 Lessons</span>
          <span><Clapperboard size={17} aria-hidden="true" />6 Modules</span>
          <span><ChartNoAxesColumnIncreasing size={17} aria-hidden="true" />Beginner → Advanced</span>
        </div>
        <p className="course-detail-instructor">Instructor <strong>F.R.C</strong></p>
        <div className="course-detail-actions">
          <Link href="/learn/thumbnail-psychology" className="course-detail-continue">Continue Learning <ArrowRight size={19} /></Link>
          <button type="button" className="course-detail-bookmark" disabled aria-label="Bookmark course"><Bookmark size={20} /></button>
        </div>
      </div>
    </section>
  );
}
