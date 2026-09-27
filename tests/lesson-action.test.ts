import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), access: vi.fn(), lock: vi.fn(), badges: vi.fn(), upsert: vi.fn(), update: vi.fn(), refresh: vi.fn(), transaction: vi.fn() }));
vi.mock("@/lib/current-user", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/prisma", () => ({ getPrisma: () => ({ $transaction: mocks.transaction, lessonProgress: { upsert: mocks.upsert, updateMany: mocks.update } }) }));
vi.mock("@/services/learning", () => ({ accessible: mocks.access, lockLearningUser: mocks.lock, evaluateBadgesForUser: mocks.badges, LearningError: class extends Error {} }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.refresh }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import { startLesson, completeLesson } from "../src/actions/learning";
import { LearningError } from "../src/services/learning";
beforeEach(() => {
  vi.clearAllMocks(); mocks.user.mockResolvedValue({ id: "student" }); mocks.access.mockResolvedValue({ id: "lesson" });
  mocks.transaction.mockImplementation(async fn => fn({ lessonProgress: { upsert: mocks.upsert, updateMany: mocks.update } }));
});
function form() { const data = new FormData(); data.set("slug", "first"); return data; }
it("starts only NOT_STARTED progress and leaves existing completed rows untouched", async () => {
  await startLesson("first");
  expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({ update: {}, create: expect.objectContaining({ status: "IN_PROGRESS", userId: "student" }) }));
  expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "student", lessonId: "lesson", status: "NOT_STARTED" } }));
});
it("completes under a user lock, preserves completion timestamps and revalidates all learning views", async () => {
  expect(await completeLesson({}, form())).toEqual({ success: "Lesson completed." });
  expect(mocks.lock).toHaveBeenCalledWith(expect.anything(), "student");
  expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({ update: {}, create: expect.objectContaining({ status: "COMPLETED", userId: "student" }) }));
  expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "student", lessonId: "lesson", status: { not: "COMPLETED" } } }));
  expect(mocks.badges).toHaveBeenCalledWith("student", expect.anything());
  for (const path of ["/dashboard", "/profile", "/roadmap", "/achievements", "/courses"]) expect(mocks.refresh).toHaveBeenCalledWith(path);
  expect(mocks.refresh).toHaveBeenCalledWith("/learn/[lessonId]", "page");
  expect(mocks.refresh).toHaveBeenCalledWith("/courses/[courseId]", "page");
});
it("rejects checkpoint bypass before writing progress or awarding badges", async () => {
  mocks.access.mockRejectedValue(new LearningError("Locked lesson."));
  expect(await completeLesson({}, form())).toEqual({ error: "Locked lesson." });
  expect(mocks.upsert).not.toHaveBeenCalled(); expect(mocks.badges).not.toHaveBeenCalled();
});
it("does not expose a database error to the student", async () => {
  mocks.transaction.mockRejectedValue(new Error("private connection detail"));
  expect(await completeLesson({}, form())).toEqual({ error: "Unable to save progress. Please try again." });
  expect(mocks.refresh).not.toHaveBeenCalled();
});
