import "server-only";
import { getPrisma } from "@/lib/prisma";
import type { BookmarkInput } from "@/lib/bookmark-validation";
import { accessible, LearningError, type Database } from "./learning";

export async function setBookmark(userId: string, input: BookmarkInput, db: Database = getPrisma()) {
  if (input.kind === "course") {
    if (!input.saved) await db.courseBookmark.deleteMany({ where: { userId, courseId: input.id } });
    else {
      const course = await db.course.findFirst({ where: { id: input.id, status: "PUBLISHED" }, select: { id: true } });
      if (!course) throw new LearningError("Course unavailable.");
      await db.courseBookmark.createMany({ data: [{ userId, courseId: input.id }], skipDuplicates: true });
    }
  } else {
    if (!input.saved) await db.lessonBookmark.deleteMany({ where: { userId, lessonId: input.id } });
    else {
      const lesson = await db.lesson.findUnique({ where: { id: input.id }, select: { slug: true } });
      if (!lesson || !await accessible(userId, "LESSON", lesson.slug, db)) throw new LearningError("Lesson unavailable.");
      await db.lessonBookmark.createMany({ data: [{ userId, lessonId: input.id }], skipDuplicates: true });
    }
  }
  return { saved: input.saved };
}
