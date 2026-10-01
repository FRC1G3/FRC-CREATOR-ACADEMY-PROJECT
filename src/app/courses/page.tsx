import { timed } from "@/lib/performance";
import "@/styles/courses/courses.css";

import CourseCatalog from "@/components/course/CourseCatalog";
import { getPrisma } from "@/lib/prisma";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { learningProgress } from "@/lib/learning-rules";
import DatabaseUnavailable from "@/components/learning/DatabaseUnavailable";

async function CoursesPage() {
  await connection();
  if (!process.env.DATABASE_URL) return <main className="courses-page"><div className="courses-container"><DatabaseUnavailable /></div></main>;
  const db = getPrisma();
  const [records, [enrollments, completed, bookmarks, passes]] = await Promise.all([
    db.course.findMany({ where: { status: "PUBLISHED" }, select: { id: true, slug: true, title: true, shortDescription: true, thumbnailUrl: true, level: true, estimatedDuration: true, _count:{select:{quizzes:{where:{status:"PUBLISHED"}}}}, modules: { select: { _count: { select: { lessons: { where: { status: "PUBLISHED" } } } } } } } }),
    getCurrentUser().then<[{courseId:string}[],{lesson:{module:{courseId:string}}}[],{courseId:string}[] | null,{quizId:string;quiz:{courseId:string}}[]]>(user => user ? Promise.all([
      db.enrollment.findMany({ where: { userId: user.id }, select: { courseId: true } }),
      db.lessonProgress.findMany({ where: { userId: user.id, status: "COMPLETED", lesson: { status: "PUBLISHED" } }, select: { lesson: { select: { module: { select: { courseId: true } } } } } }),
      db.courseBookmark.findMany({ where: { userId: user.id }, select: { courseId: true } }),
      db.quizAttempt.findMany({where:{userId:user.id,passed:true,completedAt:{not:null},quiz:{status:"PUBLISHED",course:{status:"PUBLISHED"}}},distinct:["quizId"],select:{quizId:true,quiz:{select:{courseId:true}}}}),
    ]) : [[], [], null, []]),
  ]);
  const saved = new Set(bookmarks?.map(b => b.courseId));
  const enrolled = new Set(enrollments.map(e => e.courseId));
  const completedCounts = new Map<string, number>();
  for (const progress of completed) { const id = progress.lesson.module.courseId; completedCounts.set(id, (completedCounts.get(id) ?? 0) + 1); }
  const passedCounts = new Map<string,number>();
  for (const pass of passes) { const id=pass.quiz.courseId; passedCounts.set(id,(passedCounts.get(id) ?? 0)+1); }
  const courses = records.map(c => { const lessons = c.modules.reduce((n, m) => n + m._count.lessons, 0); return { bookmark: bookmarks ? { id: c.id, saved: saved.has(c.id) } : undefined, id: c.slug, title: c.title, description: c.shortDescription, image: c.thumbnailUrl, level: c.level, duration: c.estimatedDuration, progress: enrolled.has(c.id) ? learningProgress(completedCounts.get(c.id) ?? 0, lessons, passedCounts.get(c.id) ?? 0, c._count.quizzes).percentage : null, lessons }; });
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

export default async function ProfiledPage(...args: Parameters<typeof CoursesPage>) {
  return timed("route.courses", () => CoursesPage(...args));
}
