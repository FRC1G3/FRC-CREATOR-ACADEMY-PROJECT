import { ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CourseDetailHero from "@/components/course/CourseDetailHero";
import CourseCurriculum from "@/components/course/CourseCurriculum";
import CourseProgress from "@/components/course/CourseProgress";
import { courseState, nodeHref } from "@/services/learning";
import { moduleViews } from "@/services/presentation";
import { getCurrentUser } from "@/lib/current-user";
import ActionForm from "@/components/learning/ActionForm";
import { enroll } from "@/actions/learning";
import DatabaseUnavailable from "@/components/learning/DatabaseUnavailable";
import "@/styles/courses/course-detail.css";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (!process.env.DATABASE_URL) return <main className="course-detail-page"><div className="course-detail-container"><DatabaseUnavailable /></div></main>;
  const user = await getCurrentUser();
  const state = await courseState(user?.id ?? null, courseId);
  if (!state) notFound();
  const courseModules = moduleViews(state);
  return (
    <main className="course-detail-page">
      <div className="course-detail-container">
        <CourseDetailHero title={state.course.title} description={state.course.description} lessons={state.totalLessons} modules={state.course.modules.length} level={state.course.level} instructor={state.course.instructorName}>{state.enrollment ? <Link className="course-detail-continue" href={nodeHref(state, state.current)}>Continue Learning <ArrowRight /></Link> : user ? <ActionForm action={enroll} slug={courseId} label="Enroll in Course" className="course-detail-continue" /> : <Link className="course-detail-continue" href={`/login?callbackUrl=${encodeURIComponent(`/courses/${courseId}`)}`}>Log In to Enroll</Link>}</CourseDetailHero>
        <section className="course-detail-outcomes" aria-labelledby="course-outcomes-title">
          <h2 id="course-outcomes-title">What you&apos;ll learn</h2>
          <ul>
            {state.course.modules.length ? state.course.modules.map(module => <li key={module.id}>{module.description?.trim() || module.title}</li>) : <li>Develop your skills with {state.course.title}.</li>}
          </ul>
          <Link href={`/roadmap?course=${courseId}`} className="course-detail-roadmap">View Learning Roadmap <ArrowRight size={16} /></Link>
        </section>
        <div className="course-detail-grid">
          <CourseCurriculum modules={courseModules} />
          <aside className="course-detail-sidebar" aria-label="Course progress and inspiration">
            <CourseProgress progress={state.percentage} completed={state.completedLessons} total={state.totalLessons} modules={state.completedModules} totalModules={state.course.modules.length} />
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
