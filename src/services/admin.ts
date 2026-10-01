import "server-only";
import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { reconcileCourseEnrollments, reconcileBadgesForUsers } from "@/services/learning";
import { ZodError } from "zod";
import { normalizeAvatar } from "@/lib/avatar-server";
import { videoSource } from "@/lib/video";
import { courseSchema, moduleSchema, lessonSchema, quizSchema, badgeSchema, nodeSchema, slugify, type AdminCommand } from "@/lib/admin-validation";
export class AdminError extends Error {}
export function adminError(error: unknown) {
  if (error instanceof AdminError) return error.message;
  if (error instanceof ZodError) return error.issues.map(i => `${i.path.join(".") || "Form"}: ${i.message}`).slice(0,4).join(" ");
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "That slug or order is already used. Choose another value.";
    if (error.code === "P2025") return "This record no longer exists. Refresh the page.";
    if (error.code === "P2003") return "Related records prevent this change. Unpublish instead of deleting history.";
  }
  return "Unable to save this change. Please try again.";
}
// Only the authorized action calls this server-only service. All IDs are rechecked here.
export async function executeAdmin(command: AdminCommand) {
  const { entity, operation, id } = command;
  const raw = { ...command.data };
  const automaticOrder = entity === "lesson" && operation === "save" && !id && (raw.order === "" || raw.order == null);
  if (automaticOrder) raw.order = 1;
  if (!raw.slug) raw.slug = slugify(String(raw.title ?? raw.name ?? ""));
  const prisma = getPrisma();
  if (operation !== "save" && !id) throw new AdminError("Select an existing record.");
  if (["up", "down"].includes(operation) && entity !== "node") throw new AdminError("Only roadmap nodes can be moved.");
  if (["publish", "unpublish"].includes(operation) && !["course", "lesson", "quiz"].includes(entity)) throw new AdminError("Status actions are available for courses, lessons and quizzes only.");
  // Validate before acquiring a remote transaction connection.
  const course = entity === "course" && operation === "save" ? courseSchema.parse(raw) : null;
  const courseModule = entity === "module" && operation === "save" ? moduleSchema.parse(raw) : null;
  const lesson = entity === "lesson" && operation === "save" ? lessonSchema.parse(raw) : null;
  const quiz = entity === "quiz" && operation === "save" ? quizSchema.parse(raw) : null;
  const badge = entity === "badge" && operation === "save" ? badgeSchema.parse(raw) : null;
  const node = entity === "node" && operation === "save" && !id ? nodeSchema.parse(raw) : null;
  const imageData = course ?? lesson;
  if (imageData?.thumbnailUrl.startsWith("data:")) {
    try { imageData.thumbnailUrl = await normalizeAvatar(imageData.thumbnailUrl); }
    catch { throw new AdminError("Invalid image. Choose another JPEG, PNG or WebP file."); }
  }
  return prisma.$transaction(async db => {
    const previousBadge = badge && id ? await db.badge.findUniqueOrThrow({ where: { id }, select: { status: true, conditionType: true, conditionValue: true } }) : null;
    // Resolve the affected course before mutation and serialize with student writes.
    let affectedCourseId = courseModule?.courseId ?? lesson?.courseId ?? quiz?.courseId;
    if (entity === "course") affectedCourseId = id;
    if (["delete", "publish", "unpublish"].includes(operation) && id) {
      if (entity === "lesson") affectedCourseId = (await db.lesson.findUniqueOrThrow({ where: { id }, select: { module: { select: { courseId: true } } } })).module.courseId;
      if (entity === "quiz") affectedCourseId = (await db.quiz.findUniqueOrThrow({ where: { id }, select: { courseId: true } })).courseId;
      if (entity === "module") affectedCourseId = (await db.module.findUniqueOrThrow({ where: { id }, select: { courseId: true } })).courseId;
    }
    if (affectedCourseId) await db.$queryRaw`SELECT "id" FROM "Course" WHERE "id" = ${affectedCourseId} FOR UPDATE`;
    const mutate = async () => {
    if (operation === "publish" || operation === "unpublish") {
      const status = operation === "publish" ? "PUBLISHED" : "DRAFT";
      if (entity === "course") return db.course.update({ where: { id }, data: { status } });
      if (entity === "quiz") return db.quiz.update({ where: { id }, data: { status } });
      const current = await db.lesson.findUniqueOrThrow({ where: { id }, select: { videoUrl: true } });
      if (status === "PUBLISHED" && !videoSource(current.videoUrl)) throw new AdminError("Add a valid video URL in Edit before publishing this lesson.");
      return db.lesson.update({ where: { id }, data: { status } });
    }
    if (course) return id ? db.course.update({ where: { id }, data: course }) : db.course.create({ data: course });
    if (courseModule) {
      await db.course.findUniqueOrThrow({ where: { id: courseModule.courseId }, select: { id: true } });
      if (id) { const old = await db.module.findUniqueOrThrow({ where: { id } }); if (old.courseId !== courseModule.courseId) throw new AdminError("Modules cannot be moved to another course."); }
      return id ? db.module.update({ where: { id }, data: courseModule }) : db.module.create({ data: courseModule });
    }
    if (lesson) {
      const parent = await db.module.findUnique({ where: { id: lesson.moduleId }, select: { courseId: true } });
      if (!parent || parent.courseId !== lesson.courseId) throw new AdminError("Select a module belonging to this course.");
      if (id) { const old = await db.lesson.findUniqueOrThrow({ where: { id }, select:{moduleId:true} }); if (old.moduleId !== lesson.moduleId) throw new AdminError("Existing lessons must stay in their module to preserve the learning path."); }
      const { courseId: _course, ...data } = lesson;
      void _course;
      if (automaticOrder) {
        const last = await db.lesson.findFirst({ where: { moduleId: data.moduleId }, orderBy: { order: "desc" }, select: { order: true } });
        data.order = (last?.order ?? 0) + 1;
      }
      return id ? db.lesson.update({ where: { id }, data }) : db.lesson.create({ data });
    }
    if (quiz) {
      await db.course.findUniqueOrThrow({ where: { id: quiz.courseId }, select: { id: true } });
      if (quiz.moduleId && !await db.module.findFirst({ where: { id: quiz.moduleId, courseId: quiz.courseId } })) throw new AdminError("Select a module belonging to this course.");
      const { questions, ...metadata } = quiz;
      const data = { ...metadata, moduleId: metadata.moduleId || null };
      const nested = questions?.map((q, i) => ({ text: q.text, explanation: q.explanation, order: i + 1, options: { create: q.options.map((o, j) => ({ ...o, order: j + 1 })) } }));
      if (!id) {
        if (!nested) throw new AdminError("Add at least one question.");
        return db.quiz.create({ data: { ...data, questions: { create: nested } } });
      }
      await db.$queryRaw`SELECT "id" FROM "Quiz" WHERE "id" = ${id} FOR UPDATE`;
      const old = await db.quiz.findUniqueOrThrow({ where: { id }, include: { _count: { select: { attempts: true } } } });
      if (old.courseId !== data.courseId || old.moduleId !== data.moduleId) throw new AdminError("Existing quizzes must stay in their course/module.");
      if (old._count.attempts && (questions || old.passScore !== data.passScore)) throw new AdminError("This quiz has attempts. Questions, answers and pass score are locked; edit metadata/status only.");
      if (questions) await db.question.deleteMany({ where: { quizId: id } });
      return db.quiz.update({ where: { id }, data: { ...data, ...(nested ? { questions: { create: nested } } : {}) } });
    }
    if (badge) return id ? db.badge.update({ where: { id }, data: badge }) : db.badge.create({ data: badge });
    if (entity === "node") {
      const existing = id ? await db.roadmapNode.findUniqueOrThrow({ where: { id } }) : null;
      const courseId = existing?.courseId ?? node?.courseId;
      if (!courseId) throw new AdminError("Select a course.");
      await db.$queryRaw`SELECT "id" FROM "Course" WHERE "id" = ${courseId} FOR UPDATE`;
      const nodes = await db.roadmapNode.findMany({ where: { courseId }, orderBy: { order: "asc" } });
      if (operation === "save" && existing) {
        const title = String(raw.title ?? "").trim();
        if (!title || title.length > 200) throw new AdminError("Enter a roadmap title between 1 and 200 characters.");
        return db.roadmapNode.update({ where: { id }, data: { title } });
      }
      if (operation === "delete") {
        if (await db.enrollment.count({ where: { courseId } }) || await db.lessonProgress.count({ where: { lesson: { module: { courseId } } } }) || await db.quizAttempt.count({ where: { quiz: { courseId } } })) throw new AdminError("This roadmap node cannot be removed because learner history depends on it.");
        return db.roadmapNode.delete({ where: { id } });
      }
      if (operation === "up" || operation === "down") {
        const index = nodes.findIndex(n => n.id === id), other = nodes[index + (operation === "up" ? -1 : 1)];
        if (!other || !existing) throw new AdminError("Already at the end of the path.");
        await db.roadmapNode.update({ where: { id }, data: { order: (nodes.at(-1)?.order ?? 0) + 1 } });
        await db.roadmapNode.update({ where: { id: other.id }, data: { order: existing.order } });
        return db.roadmapNode.update({ where: { id }, data: { order: other.order } });
      }
      if (!node) throw new AdminError("Add a new node or use the ordering controls.");
      const valid = node.type === "LESSON" ? await db.lesson.findFirst({ where: { id: node.targetId, status:"PUBLISHED", module: { courseId } }, select:{id:true} }) : node.type === "QUIZ" ? await db.quiz.findFirst({ where: { id: node.targetId, status:"PUBLISHED", courseId } }) : await db.badge.findFirst({ where: { id: node.targetId, status:"ACTIVE" } });
      if (!valid) throw new AdminError("Target does not belong to this course or no longer exists.");
      if (nodes.some(n => [n.lessonId, n.quizId, n.badgeId].includes(node.targetId))) throw new AdminError("This target already has a roadmap node.");
      return db.roadmapNode.create({ data: { courseId, type: node.type, title: node.title, order: (nodes.at(-1)?.order ?? 0) + 1, lessonId: node.type === "LESSON" ? node.targetId : null, quizId: node.type === "QUIZ" ? node.targetId : null, badgeId: node.type === "REWARD" ? node.targetId : null } });
    }
    if (operation === "delete") {
      if (entity === "course") {
        await db.$queryRaw`SELECT "id" FROM "Course" WHERE "id" = ${id!} FOR UPDATE`;
        const row = await db.course.findUniqueOrThrow({ where: { id }, include: { _count: { select: { modules: true, quizzes: true, enrollments: true, roadmapNodes: true } } } });
        if (Object.values(row._count).some(Boolean)) throw new AdminError("This course contains content or learning history and cannot be deleted. Set it to Draft instead.");
        return db.course.delete({ where: { id } });
      }
      if (entity === "module") {
        await db.$queryRaw`SELECT "id" FROM "Module" WHERE "id" = ${id!} FOR UPDATE`;
        const row = await db.module.findUniqueOrThrow({ where: { id }, include: { _count: { select: { lessons: true, quizzes: true } } } });
        if (row._count.lessons || row._count.quizzes) throw new AdminError("Only empty modules can be deleted.");
        return db.module.delete({ where: { id } });
      }
      if (entity === "lesson") {
        if (await db.lessonProgress.count({ where: { lessonId: id } })) throw new AdminError("This lesson has learner history and cannot be deleted. Set it to Draft instead.");
        const nodes = await db.roadmapNode.count({ where: { lessonId: id } });
        if (nodes) {
          if (await db.enrollment.count({ where: { courseId: affectedCourseId } }) || await db.lessonProgress.count({ where: { lesson: { module: { courseId: affectedCourseId } } } }) || await db.quizAttempt.count({ where: { quiz: { courseId: affectedCourseId } } })) throw new AdminError("This lesson belongs to a learning path with students/history. Set it to Draft instead.");
          await db.roadmapNode.deleteMany({ where: { lessonId: id } });
        }
        return db.lesson.delete({ where: { id } });
      }
      if (entity === "quiz") {
        if (await db.quizAttempt.count({ where: { quizId: id } })) throw new AdminError("This quiz has learner history and cannot be deleted. Set it to Draft instead.");
        if (await db.roadmapNode.count({ where: { quizId: id } })) throw new AdminError("This quiz is used by a roadmap and cannot be deleted. Remove the unused roadmap node first or set it to Draft.");
        return db.quiz.delete({ where: { id } });
      }
      if (entity === "badge") {
        if (await db.userBadge.count({ where: { badgeId: id } })) throw new AdminError("This badge has already been earned and cannot be deleted. Set it to Inactive instead.");
        if (await db.roadmapNode.count({ where: { badgeId: id } })) throw new AdminError("This badge is used by a roadmap and cannot be deleted. Remove the unused roadmap node first or set it to Inactive.");
        return db.badge.delete({ where: { id } });
      }
    }
    throw new AdminError("Unsupported operation.");
    };
    const result = await mutate();
    if (affectedCourseId) await reconcileCourseEnrollments(affectedCourseId, db);
    if (badge?.status === "ACTIVE" && (!previousBadge || previousBadge.status !== "ACTIVE" || previousBadge.conditionType !== badge.conditionType || previousBadge.conditionValue !== badge.conditionValue)) {
      await reconcileBadgesForUsers(null, db, result.id);
    }
    return result;
  }, { timeout: 30000 });
}
