import { expect, it, vi } from "vitest";
import { reconcileCourseEnrollments, type Database } from "../src/services/learning";

function fixture() {
  const lessons = [{ id: "l1", moduleId: "m", status: "PUBLISHED" }];
  const quizzes: { id: string; moduleId: string; status: string }[] = [];
  const progress = [{ userId: "u", lessonId: "l1", status: "COMPLETED" }];
  const attempts: { userId: string; quizId: string; passed: boolean }[] = [];
  const enrollment = { userId: "u", courseId: "c", completedAt: null as Date | null };
  const model = {
    user:{findMany:vi.fn().mockResolvedValue([])},badge:{findMany:vi.fn().mockResolvedValue([])},userBadge:{createMany:vi.fn()},
    course: { findUnique: vi.fn(async () => ({ id: "c", modules: [{ id: "m", lessons: lessons.filter(l => l.status === "PUBLISHED") }], quizzes: quizzes.filter(q => q.status === "PUBLISHED"), roadmapNodes: [] })) },
    enrollment: { findMany: vi.fn(async () => [enrollment]), updateMany: vi.fn(async ({ where, data }: { where: { completedAt: null | { not: null } }; data: { completedAt: Date | null } }) => {
      if ((where.completedAt === null) === (enrollment.completedAt === null)) enrollment.completedAt = data.completedAt;
    }) },
    lessonProgress: { findMany: vi.fn(async () => progress) },
    quizAttempt: { findMany: vi.fn(async () => attempts) },
  };
  const sync = () => reconcileCourseEnrollments("c", model as unknown as Database);
  return { lessons, quizzes, progress, attempts, enrollment, sync, model };
}

it("sets completion, clears it for a newly published lesson, then completes again", async () => {
  const f = fixture();
  await f.sync(); expect(f.enrollment.completedAt).toBeInstanceOf(Date);
  f.lessons.push({ id: "l2", moduleId: "m", status: "PUBLISHED" });
  await f.sync(); expect(f.enrollment.completedAt).toBeNull();
  f.progress.push({ userId: "u", lessonId: "l2", status: "COMPLETED" });
  await f.sync(); expect(f.enrollment.completedAt).toBeInstanceOf(Date);
});
it("draft lessons do not reset an existing completion date; publishing does", async () => {
  const f = fixture(); await f.sync(); const original = f.enrollment.completedAt;
  f.lessons.push({ id: "l2", moduleId: "m", status: "DRAFT" });
  await f.sync(); expect(f.enrollment.completedAt).toBe(original);
  f.lessons[1].status = "PUBLISHED"; await f.sync(); expect(f.enrollment.completedAt).toBeNull();
  f.lessons[1].status = "DRAFT"; await f.sync(); expect(f.enrollment.completedAt).toBeInstanceOf(Date);
});
it("a new published quiz is required, any historical pass satisfies it", async () => {
  const f = fixture(); await f.sync();
  f.quizzes.push({ id: "q", moduleId: "m", status: "DRAFT" });
  await f.sync(); expect(f.enrollment.completedAt).not.toBeNull();
  f.quizzes[0].status = "PUBLISHED"; await f.sync(); expect(f.enrollment.completedAt).toBeNull();
  f.attempts.push({ userId: "u", quizId: "q", passed: false }); await f.sync(); expect(f.enrollment.completedAt).toBeNull();
  f.attempts.push({ userId: "u", quizId: "q", passed: true }); await f.sync(); expect(f.enrollment.completedAt).toBeInstanceOf(Date);
  f.attempts.push({ userId: "u", quizId: "q", passed: false }); await f.sync(); expect(f.enrollment.completedAt).not.toBeNull();
});
it("removing unmet requirements restores completion without altering history", async () => {
  const f = fixture(); f.quizzes.push({ id: "q", moduleId: "m", status: "PUBLISHED" });
  const history = JSON.stringify([f.progress, f.attempts]);
  await f.sync(); expect(f.enrollment.completedAt).toBeNull();
  f.quizzes.pop(); await f.sync(); expect(f.enrollment.completedAt).not.toBeNull();
  expect(JSON.stringify([f.progress, f.attempts])).toBe(history);
});
it("does not count another student's progress or passes", async () => {
  const f = fixture(); f.progress[0].userId = "someone-else";
  await f.sync(); expect(f.enrollment.completedAt).toBeNull();
});
it("an empty course is not complete", async () => {
  const f = fixture(); await f.sync(); f.lessons.pop();
  await f.sync(); expect(f.enrollment.completedAt).toBeNull();
});
it("unpublishing the unmet quiz reconciles both completion and eligible course badges",async()=>{
  const f=fixture();f.quizzes.push({id:"q",moduleId:"m",status:"PUBLISHED"});
  f.model.user.findMany.mockImplementation(async()=>[{id:"u",enrollments:[{...f.enrollment,course:await f.model.course.findUnique()}],lessonProgress:f.progress,quizAttempts:[]}]);
  f.model.badge.findMany.mockResolvedValue([{id:"b",conditionType:"COURSE_COMPLETE",conditionValue:1,users:[]}]);
  await f.sync();expect(f.enrollment.completedAt).toBeNull();expect(f.model.userBadge.createMany).not.toHaveBeenCalled();
  f.quizzes[0].status="DRAFT";await f.sync();expect(f.enrollment.completedAt).toBeInstanceOf(Date);
  expect(f.model.userBadge.createMany).toHaveBeenCalledWith({data:[{userId:"u",badgeId:"b"}],skipDuplicates:true});
});
