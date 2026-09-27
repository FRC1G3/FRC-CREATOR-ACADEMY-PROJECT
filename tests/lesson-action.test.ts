import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), access: vi.fn(), overview: vi.fn(), derive: vi.fn(), lock: vi.fn(), badges: vi.fn(), upsert: vi.fn(), update: vi.fn(), refresh: vi.fn(), transaction: vi.fn() }));
vi.mock("@/lib/current-user", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/prisma", () => ({ getPrisma: () => ({ $transaction: mocks.transaction, lessonProgress: { upsert: mocks.upsert, updateMany: mocks.update } }) }));
vi.mock("@/services/learning", () => ({ studentOverview: mocks.overview, overviewWithCompletedLesson: mocks.derive, accessible: mocks.access, lockLearningUser: mocks.lock, evaluateBadgesForUser: mocks.badges, LearningError: class extends Error {} }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.refresh }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import { startLesson, completeLesson } from "../src/actions/learning";

beforeEach(() => {
  vi.clearAllMocks(); mocks.user.mockResolvedValue({ id: "student" }); mocks.access.mockResolvedValue({ id: "lesson" });
  mocks.overview.mockResolvedValue({states:[{enrollment:{},lessons:[{id:"lesson",slug:"first",title:"First"}],nodes:[{lessonId:"lesson",status:"current"}],completed:new Set()}]});
  mocks.derive.mockImplementation(value => value);
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
  expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({ update: {status:"COMPLETED",completedAt:expect.any(Date)}, create: expect.objectContaining({ status: "COMPLETED", userId: "student" }) }));
  expect(mocks.update).not.toHaveBeenCalled();
  expect(mocks.overview).toHaveBeenCalledTimes(1);
  expect(mocks.badges).toHaveBeenCalledWith("student", expect.anything(), expect.anything());
  for (const path of ["/dashboard", "/profile", "/roadmap", "/achievements", "/courses"]) expect(mocks.refresh).toHaveBeenCalledWith(path);
  expect(mocks.refresh).toHaveBeenCalledWith("/learn/[lessonId]", "page");
  expect(mocks.refresh).toHaveBeenCalledWith("/courses/[courseId]", "page");
});
it("rejects checkpoint bypass before writing progress or awarding badges", async () => {
  const snapshot = await mocks.overview(); snapshot.states[0].nodes[0].status="locked";
  expect(await completeLesson({}, form())).toEqual({ error: "Enroll and complete earlier roadmap steps first." });
  expect(mocks.upsert).not.toHaveBeenCalled(); expect(mocks.badges).not.toHaveBeenCalled();
});
it("does not expose a database error to the student", async () => {
  mocks.transaction.mockRejectedValue(new Error("private connection detail"));
  expect(await completeLesson({}, form())).toEqual({ error: "Unable to save progress. Please try again." });
  expect(mocks.refresh).not.toHaveBeenCalled();
});

it("does not rewrite the timestamp of an already completed lesson",async()=>{
 const snapshot=await mocks.overview();snapshot.states[0].completed.add("lesson");
 expect(await completeLesson({},form())).toHaveProperty("success");
 expect(mocks.upsert).not.toHaveBeenCalled();expect(mocks.update).not.toHaveBeenCalled();
});
it("rejects an unenrolled lesson before progress writes",async()=>{
 mocks.overview.mockResolvedValue({states:[]});expect(await completeLesson({},form())).toHaveProperty("error");expect(mocks.upsert).not.toHaveBeenCalled();
});
