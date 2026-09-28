import { beforeEach, expect, it, vi } from "vitest";
import type { Database } from "../src/services/learning";
const access = vi.hoisted(() => vi.fn());
vi.mock("@/services/learning", () => ({ accessible: access, LearningError: class extends Error {} }));
import { setBookmark } from "../src/services/bookmarks";
import { bookmarkSchema } from "../src/lib/bookmark-validation";
function fixture() {
  const courseBookmark = { createMany: vi.fn(), deleteMany: vi.fn() };
  const lessonBookmark = { createMany: vi.fn(), deleteMany: vi.fn() };
  const course = { findFirst: vi.fn().mockResolvedValue({ id: "c" }) };
  const lesson = { findUnique: vi.fn().mockResolvedValue({ slug: "lesson" }) };
  return { courseBookmark, lessonBookmark, course, db: { courseBookmark, lessonBookmark, course, lesson } as unknown as Database };
}
beforeEach(() => { vi.clearAllMocks(); access.mockResolvedValue({ id: "l" }); });
it("creates a published course bookmark for the supplied session user", async () => {
  const f = fixture(); await setBookmark("u", { kind: "course", id: "c", saved: true }, f.db);
  expect(f.course.findFirst).toHaveBeenCalledWith({ where: { id: "c", status: "PUBLISHED" }, select: { id: true } });
  expect(f.courseBookmark.createMany).toHaveBeenCalledWith({ data: [{ userId: "u", courseId: "c" }], skipDuplicates: true });
});
it("uses idempotent insert semantics for repeated save requests", async () => {
  const f = fixture(); const records = new Set<string>();
  f.courseBookmark.createMany.mockImplementation(({ data, skipDuplicates }) => { expect(skipDuplicates).toBe(true); for (const item of data) records.add(`${item.userId}:${item.courseId}`); });
  await setBookmark("u", { kind: "course", id: "c", saved: true }, f.db);
  await setBookmark("u", { kind: "course", id: "c", saved: true }, f.db);
  expect(records.size).toBe(1);
});
it.each(["course", "lesson"] as const)("deletes only the current user's %s bookmark, never its target", async kind => {
  const f = fixture(); await setBookmark("owner", { kind, id: "target", saved: false }, f.db);
  const model = kind === "course" ? f.courseBookmark : f.lessonBookmark;
  expect(model.deleteMany).toHaveBeenCalledWith({ where: { userId: "owner", [`${kind}Id`]: "target" } });
  expect(f.course.findFirst).not.toHaveBeenCalled(); expect(access).not.toHaveBeenCalled();
});
it("checks lesson access before storing", async () => {
  const f = fixture(); await setBookmark("u", { kind: "lesson", id: "l", saved: true }, f.db);
  expect(access).toHaveBeenCalledWith("u", "LESSON", "lesson", f.db);
  expect(f.lessonBookmark.createMany).toHaveBeenCalledWith({ data: [{ userId: "u", lessonId: "l" }], skipDuplicates: true });
});
it("rejects a locked lesson without creating a bookmark", async () => {
  const f = fixture(); access.mockRejectedValue(new Error("Locked"));
  await expect(setBookmark("u", { kind: "lesson", id: "l", saved: true }, f.db)).rejects.toThrow("Locked");
  expect(f.lessonBookmark.createMany).not.toHaveBeenCalled();
});
it("rejects an unpublished course", async () => {
  const f = fixture(); f.course.findFirst.mockResolvedValue(null);
  await expect(setBookmark("u", { kind: "course", id: "c", saved: true }, f.db)).rejects.toThrow("unavailable");
  expect(f.courseBookmark.createMany).not.toHaveBeenCalled();
});
it("does not accept client-supplied ownership or an ambiguous target", () => {
  expect(bookmarkSchema.safeParse({ kind: "course", id: "c", saved: true, userId: "victim" }).success).toBe(false);
  expect(bookmarkSchema.safeParse({ kind: "both", id: "c", saved: true }).success).toBe(false);
});
