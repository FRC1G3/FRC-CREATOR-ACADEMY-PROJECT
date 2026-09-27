import "@/styles/courses/courses.css";

import CourseCatalog from "@/components/course/CourseCatalog";
import { getPrisma } from "@/lib/prisma";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { percentage } from "@/lib/learning-rules";
import DatabaseUnavailable from "@/components/learning/DatabaseUnavailable";

export default async function CoursesPage() {
  await connection();
  if (!process.env.DATABASE_URL) return <main className="courses-page"><div className="courses-container"><DatabaseUnavailable /></div></main>;
  const db = getPrisma();
  const [records, [enrollments, completed]] = await Promise.all([
    db.course.findMany({ where: { status: "PUBLISHED" }, select: { id: true, slug: true, title: true, shortDescription: true, thumbnailUrl: true, level: true, estimatedDuration: true, modules: { select: { _count: { select: { lessons: { where: { status: "PUBLISHED" } } } } } } } }),
    getCurrentUser().then<[{ courseId: string }[], { lesson: { module: { courseId: string } } }[]]>(user => user ? Promise.all([
      db.enrollment.findMany({ where: { userId: user.id }, select: { courseId: true } }),
      db.lessonProgress.findMany({ where: { userId: user.id, status: "COMPLETED", lesson: { status: "PUBLISHED" } }, select: { lesson: { select: { module: { select: { courseId: true } } } } } }),
    ]) : [[], []]),
  ]);
  const enrolled = new Set(enrollments.map(e => e.courseId));
  const completedCounts = new Map<string, number>();
  for (const progress of completed) { const id = progress.lesson.module.courseId; completedCounts.set(id, (completedCounts.get(id) ?? 0) + 1); }
  const courses = records.map(c => { const lessons = c.modules.reduce((n, m) => n + m._count.lessons, 0); return { id: c.slug, title: c.title, description: c.shortDescription, image: c.thumbnailUrl, level: c.level, duration: c.estimatedDuration, progress: enrolled.has(c.id) ? percentage(completedCounts.get(c.id) ?? 0, lessons) : null, lessons }; });
  return (
    <main className="courses-page">
      <div className="courses-container">
        <header className="courses-heading">
          <span>COURSES</span>
          <h1>Explore Courses</h1>
          <p>Practical lessons to help you create, grow and succeed.</p>
        </header>
        <CourseCatalog courses={courses} />
        <section className="courses-banner app-card">
          <div><h2>Same You.<br />A More Creative You.</h2><span /></div>
          <p>DISCIPLINE<br />CREATES<br />FREEDOM</p>
        </section>
      </div>
    </main>
  );
}
