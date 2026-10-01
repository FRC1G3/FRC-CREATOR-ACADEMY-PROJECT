import { timed } from "@/lib/performance";
import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import BookmarkButton from "@/components/learning/BookmarkButton";
async function BookmarksPage() {
  const user = await requireUser("/bookmarks"), db = getPrisma();
  const [courses, lessons] = await Promise.all([
    db.courseBookmark.findMany({ where: { userId: user.id, course: { status: "PUBLISHED" } }, orderBy: { createdAt: "desc" }, select: { course: { select: { id: true, slug: true, title: true, level: true } } } }),
    db.lessonBookmark.findMany({ where: { userId: user.id, lesson: { status: "PUBLISHED", module: { course: { status: "PUBLISHED" } } } }, orderBy: { createdAt: "desc" }, select: { lesson: { select: { id: true, slug: true, title: true, module: { select: { title: true, course: { select: { title: true } } } } } } } }),
  ]);
  return <main className="bookmarks-page"><header><span className="section-eyebrow">YOUR COLLECTION</span><h1>Bookmarks</h1><p>Keep your courses and lessons close.</p></header>
    {!courses.length && !lessons.length && <div className="app-card learning-empty"><h2>No bookmarks yet.</h2><p>Save courses or lessons to find them here.</p><Link href="/courses">Explore Courses</Link></div>}
    <section><h2>Saved Courses</h2>{!courses.length && <p>No saved courses.</p>}{courses.map(({ course }) => <article className="app-card bookmark-item" key={course.id}><div><Link href={`/courses/${course.slug}`}>{course.title}</Link><p>{course.level}</p></div><BookmarkButton kind="course" id={course.id} initialSaved /></article>)}</section>
    <section><h2>Saved Lessons</h2>{!lessons.length && <p>No saved lessons.</p>}{lessons.map(({ lesson }) => <article className="app-card bookmark-item" key={lesson.id}><div><Link href={`/learn/${lesson.slug}`}>{lesson.title}</Link><p>{lesson.module.course.title} · {lesson.module.title}</p></div><BookmarkButton kind="lesson" id={lesson.id} initialSaved /></article>)}</section>
  </main>;
}

export default async function ProfiledPage(...args: Parameters<typeof BookmarksPage>) {
  return timed("route.bookmarks", () => BookmarksPage(...args));
}
