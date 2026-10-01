import "server-only";
import { requireAdmin } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import { adminCourseProgress, progressStatus } from "@/lib/admin-students";
import { learningProgress } from "@/lib/learning-rules";
import type { Prisma } from "@/generated/prisma/client";
export async function adminCatalog() {
  await requireAdmin();
  return getPrisma().course.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, modules: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } } } });
}
export async function adminCourses() {
  await requireAdmin();
  const rows = await getPrisma().course.findMany({ orderBy: { updatedAt: "desc" }, select: { id:true, title:true, shortDescription:true, thumbnailUrl:true, status:true, updatedAt:true, modules: { select: { _count: { select: { lessons: true } } } }, _count: { select: { enrollments: true } } } });
  return rows.map(c => ({ id: c.id, title: c.title, description: c.shortDescription, image: c.thumbnailUrl || "/images/hero.png", lessons: c.modules.reduce((n,m) => n+m._count.lessons,0), modules: c.modules.length, students: c._count.enrollments, status: c.status === "PUBLISHED" ? "Published" : "Draft", updated: c.updatedAt.toISOString().slice(0,10) }));
}
export async function adminLessons() {
  await requireAdmin();
  const rows = await getPrisma().lesson.findMany({ orderBy: [{ module: { course: { title: "asc" } } }, { module: { order: "asc" } }, { order: "asc" }], select: { id: true, title: true, moduleId: true, durationSeconds: true, status: true, order: true, module: { select: { title: true, courseId: true, course: { select: { title: true } } } } } });
  return rows.map(l => ({ id: l.id, title: l.title, course: l.module.course.title, courseId: l.module.courseId, module: l.module.title, moduleId: l.moduleId, duration: `${Math.floor(l.durationSeconds/60)}:${String(l.durationSeconds%60).padStart(2,"0")}`, status: l.status === "PUBLISHED" ? "Published" : "Draft", order: l.order }));
}
export async function adminQuizzes() {
  await requireAdmin();
  const rows = await getPrisma().quiz.findMany({ orderBy: { updatedAt: "desc" }, include: { course: { select: { title: true } }, module: { select: { title: true } }, _count: { select: { questions: true, attempts: true } } } });
  return rows.map(q => ({ id:q.id, title:q.title, course:q.course.title, courseId:q.courseId, moduleId:q.moduleId, module:q.module?.title ?? "Course checkpoint", questions:q._count.questions, attempts:q._count.attempts, passScore:q.passScore, status:q.status === "PUBLISHED" ? "Published" : "Draft" }));
}
export async function adminStudents() {
  await requireAdmin();
  const rows = await getPrisma().user.findMany({ where: { role: "STUDENT" }, orderBy: { createdAt: "desc" }, select: { id:true, name:true, email:true, createdAt:true, enrollments:{ where:{course:{status:"PUBLISHED"}}, select:{ course:{select:adminProgressCourseSelect} } }, lessonProgress:{ select:{ lessonId:true,status:true } }, quizAttempts:{ select:{quizId:true,passed:true,completedAt:true} }, _count:{ select:{ quizAttempts:true, badges:true } } } });
  return rows.map(u => {
    const courseProgress=u.enrollments.map(e=>adminCourseProgress(e.course,u.lessonProgress,u.quizAttempts));
    const total=courseProgress.reduce((n,c)=>n+c.total,0),done=courseProgress.reduce((n,c)=>n+c.completed,0);
    return { id:u.id, name:u.name, email:u.email, courseIds:courseProgress.map(c=>c.id), courses:courseProgress.map(c=>c.title), course:u.enrollments.map(e=>e.course.title).join(", ") || "Not enrolled", courseProgress, progress:learningProgress(done,total,0,0).percentage, progressStatus:progressStatus(done,total,null,courseProgress.some(c=>c.status==="In Progress")), lessons:courseProgress.reduce((n,c)=>n+c.completedLessons,0), quizzes:u._count.quizAttempts, badges:u._count.badges, joined:u.createdAt.toISOString().slice(0,10), status:u.enrollments.length ? "Active" : "Inactive" };
  });
}

export async function adminCourseOptions() {
  await requireAdmin();
  return getPrisma().course.findMany({ orderBy:{title:"asc"}, select:{id:true,title:true} });
}

const adminProgressCourseSelect = { id:true,title:true,modules:{select:{lessons:{where:{status:"PUBLISHED"},select:{id:true}}}},quizzes:{where:{status:"PUBLISHED"},select:{id:true}} } satisfies Prisma.CourseSelect;
export const adminStudentDetailSelect = {
    name:true,email:true,createdAt:true,
    enrollments:{where:{course:{status:"PUBLISHED"}},orderBy:{enrolledAt:"desc"},select:{enrolledAt:true,completedAt:true,course:{select:adminProgressCourseSelect}}},
    lessonProgress:{orderBy:{completedAt:"desc"},select:{id:true,lessonId:true,status:true,completedAt:true,lesson:{select:{title:true,module:{select:{courseId:true,course:{select:{title:true}}}}}}}},
    quizAttempts:{orderBy:{startedAt:"desc"},select:{id:true,quizId:true,score:true,passed:true,startedAt:true,completedAt:true,quiz:{select:{title:true,course:{select:{title:true}}}}}},
    badges:{orderBy:{earnedAt:"desc"},select:{id:true,earnedAt:true,badge:{select:{name:true,icon:true}}}},
  } satisfies Prisma.UserSelect;

export async function adminStudentDetail(userId:string) {
  await requireAdmin();
  const user=await getPrisma().user.findFirst({where:{id:userId,role:"STUDENT"},select:adminStudentDetailSelect});
  if(!user)return null;
  const courseProgress=user.enrollments.map(e=>adminCourseProgress(e.course,user.lessonProgress,user.quizAttempts));
  return {...user,lessonProgress:user.lessonProgress.filter(p=>p.status==="COMPLETED"),courseProgress};
}
