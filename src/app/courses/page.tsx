import "@/styles/courses/courses.css";
import { Search } from "lucide-react";
import CourseCard from "@/components/course/CourseCard";
import { getPrisma } from "@/lib/prisma";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { percentage } from "@/lib/learning-rules";

export default async function CoursesPage() {
  await connection();
  const user = await getCurrentUser();
  const [enrollments, completed] = user ? await Promise.all([getPrisma().enrollment.findMany({ where: { userId: user.id }, select: { course: { select: { slug: true } } } }), getPrisma().lessonProgress.findMany({ where: { userId: user.id, status: "COMPLETED", lesson: { status: "PUBLISHED" } }, select: { lesson: { select: { module: { select: { course: { select: { slug: true } } } } } } } })]) : [[], []];
  const records = await getPrisma().course.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, title: true, shortDescription: true, thumbnailUrl: true, level: true, estimatedDuration: true, modules: { select: { _count: { select: { lessons: { where: { status: "PUBLISHED" } } } } } } } });
  const courses = records.map(c => { const lessons = c.modules.reduce((n, m) => n + m._count.lessons, 0); return { id: c.slug, title: c.title, description: c.shortDescription, image: c.thumbnailUrl, level: c.level, duration: c.estimatedDuration, progress: enrollments.some(e => e.course.slug === c.slug) ? percentage(completed.filter(p => p.lesson.module.course.slug === c.slug).length, lessons) : null, lessons }; });
  return (
    <main className="courses-page">
      <div className="courses-container">
        <header className="courses-heading">
          <span>COURSES</span>
          <h1>Explore Courses</h1>
          <p>Practical lessons to help you create, grow and succeed.</p>
        </header>
        <div className="courses-toolbar">
          <label className="courses-search">
            <Search size={21} aria-hidden="true" />
            <input type="search" readOnly placeholder="Search courses..." aria-label="Search courses" />
          </label>
          <div className="courses-filters" role="group" aria-label="Course level">
            <button className="active" type="button" disabled aria-pressed="true">All</button>
            <button type="button" disabled aria-pressed="false">Beginner</button>
            <button type="button" disabled aria-pressed="false">Intermediate</button>
            <button type="button" disabled aria-pressed="false">Advanced</button>
          </div>
        </div>
        <section className="courses-grid" aria-label="Available and upcoming courses">
          {courses.length === 0 && <p>No published courses yet.</p>}{courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </section>
        <section className="courses-banner app-card">
          <div><h2>Same You.<br />A More Creative You.</h2><span /></div>
          <p>DISCIPLINE<br />CREATES<br />FREEDOM</p>
        </section>
      </div>
    </main>
  );
}
