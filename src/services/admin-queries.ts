import "server-only";
import { requireAdmin } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
export async function adminCatalog() {
  await requireAdmin();
  return getPrisma().course.findMany({ orderBy: { title: "asc" }, include: { modules: { orderBy: { order: "asc" } } } });
}
export async function adminCourses() {
  await requireAdmin();
  const rows = await getPrisma().course.findMany({ orderBy: { updatedAt: "desc" }, include: { modules: { include: { _count: { select: { lessons: true } } } }, _count: { select: { enrollments: true } } } });
  return rows.map(c => ({ id: c.id, title: c.title, description: c.shortDescription, image: c.thumbnailUrl || "/images/hero.png", lessons: c.modules.reduce((n,m) => n+m._count.lessons,0), modules: c.modules.length, students: c._count.enrollments, status: c.status === "PUBLISHED" ? "Published" : "Draft", updated: c.updatedAt.toISOString().slice(0,10) }));
}
export async function adminLessons() {
  await requireAdmin();
  const rows = await getPrisma().lesson.findMany({ orderBy: [{ module: { course: { title: "asc" } } }, { module: { order: "asc" } }, { order: "asc" }], include: { module: { include: { course: { select: { title: true } } } } } });
  return rows.map(l => ({ id: l.id, title: l.title, course: l.module.course.title, module: l.module.title, moduleId: l.moduleId, duration: `${Math.floor(l.durationSeconds/60)}:${String(l.durationSeconds%60).padStart(2,"0")}`, status: l.status === "PUBLISHED" ? "Published" : "Draft", order: l.order }));
}
export async function adminQuizzes() {
  await requireAdmin();
  const rows = await getPrisma().quiz.findMany({ orderBy: { updatedAt: "desc" }, include: { course: { select: { title: true } }, module: { select: { title: true } }, _count: { select: { questions: true, attempts: true } } } });
  return rows.map(q => ({ id:q.id, title:q.title, course:q.course.title, module:q.module?.title ?? "Course checkpoint", questions:q._count.questions, attempts:q._count.attempts, passScore:q.passScore, status:q.status === "PUBLISHED" ? "Published" : "Draft" }));
}
export async function adminStudents() {
  await requireAdmin();
  const rows = await getPrisma().user.findMany({ where: { role: "STUDENT" }, orderBy: { createdAt: "desc" }, select: { id:true, name:true, email:true, createdAt:true, enrollments:{ select:{ course:{ select:{ title:true, modules:{ select:{ lessons:{ where:{ status:"PUBLISHED" }, select:{ id:true } } } } } } } }, lessonProgress:{ where:{ status:"COMPLETED" }, select:{ lessonId:true } }, _count:{ select:{ quizAttempts:true, badges:true } } } });
  return rows.map(u => { const lessons = new Set(u.enrollments.flatMap(e => e.course.modules.flatMap(m => m.lessons.map(l => l.id)))); const done = u.lessonProgress.filter(p => lessons.has(p.lessonId)).length; return { id:u.id, name:u.name, email:u.email, courses:u.enrollments.map(e => e.course.title), course:u.enrollments.map(e => e.course.title).join(", ") || "Not enrolled", progress: lessons.size ? Math.round(done/lessons.size*100) : 0, lessons:done, quizzes:u._count.quizAttempts, badges:u._count.badges, joined:u.createdAt.toISOString().slice(0,10), status:u.enrollments.length ? "Active" : "Inactive" }; });
}
