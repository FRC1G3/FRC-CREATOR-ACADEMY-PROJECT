import { ArrowRight, ChevronUp, Quote } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CourseDetailHero from "@/components/course/CourseDetailHero";
import CourseModule from "@/components/course/CourseModule";
import CourseProgress from "@/components/course/CourseProgress";
import { courseModules } from "@/data/course-detail-data";
import "@/styles/courses/course-detail.css";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (courseId !== "youtube") notFound();
  return (
    <main className="course-detail-page">
      <div className="course-detail-container">
        <CourseDetailHero />
        <section className="course-detail-outcomes" aria-labelledby="course-outcomes-title">
          <h2 id="course-outcomes-title">What you&apos;ll learn</h2>
          <ul>
            <li>Build a structured YouTube content strategy</li>
            <li>Understand thumbnails, titles and audience behavior</li>
            <li>Learn production, growth and monetization fundamentals</li>
          </ul>
          <Link href="/roadmap" className="course-detail-roadmap">View Learning Roadmap <ArrowRight size={16} /></Link>
        </section>
        <div className="course-detail-grid">
          <section className="course-curriculum" aria-labelledby="course-content-title">
            <div className="course-curriculum-heading">
              <h2 id="course-content-title">Course Content</h2>
              <span aria-disabled="true" title="Static curriculum preview">Expand All <ChevronUp size={16} aria-hidden="true" /></span>
            </div>
            <div className="course-module-list">
              {courseModules.map((module) => <CourseModule key={module.number} module={module} />)}
            </div>
          </section>
          <aside className="course-detail-sidebar" aria-label="Course progress and inspiration">
            <CourseProgress />
            <div className="course-detail-motivation app-card">
              <Quote size={30} aria-hidden="true" />
              <p>Discipline<br />Creates<br />Freedom.</p>
              <span />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
