// Explicit opt-in integration check: creates and deletes its own temporary users only.
import "dotenv/config";
import { randomUUID, createHash } from "node:crypto";
import assert from "node:assert/strict";
import sharp from "sharp";
import { getPrisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { setBookmark } from "../src/services/bookmarks";
import { accessible, courseState } from "../src/services/learning";
import { moduleViews } from "../src/services/presentation";
import { normalizeAvatar } from "../src/lib/avatar-server";

async function main() {
  if (process.env.RUN_STUDENT_UX_CHECK !== "1") throw new Error("Set RUN_STUDENT_UX_CHECK=1 to create temporary integration users.");
  const db = getPrisma();
  const origin = "http://localhost:3000";
  const ids: string[] = [];
  const checks: string[] = [];
  const password = randomUUID();
  const email = `ux-${randomUUID()}@example.invalid`;
  async function cleanup(id: string) {
    const owner = await db.user.findUniqueOrThrow({ where: { id }, select: { email: true } });
    await db.lessonProgress.deleteMany({ where: { userId: id } });
    await db.enrollment.deleteMany({ where: { userId: id } });
    await db.user.delete({ where: { id } });
    await db.authThrottle.deleteMany({ where: { key: createHash("sha256").update(owner.email).digest("hex") } });
  }
  if (process.env.RUN_STUDENT_UX_CLEANUP === "1") {
    const fixtures = await db.user.findMany({ where: { name: { in: ["Temporary UX Check", "Temporary Isolation Check"] }, email: { startsWith: "ux-", endsWith: "@example.invalid" }, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } }, select: { id: true } });
    for (const fixture of fixtures) await cleanup(fixture.id);
    console.log(`Interrupted-run fixtures cleaned: ${fixtures.length}`); await db.$disconnect(); return;
  }
  try {
    const course = await db.course.findFirst({ where: { status: "PUBLISHED", modules: { some: { lessons: { some: { status: "PUBLISHED" } } } } }, select: { id: true, slug: true } });
    assert(course, "A published course is needed for this check.");
    const userId = randomUUID();
    const user = await db.user.create({ data: { id: userId, email, name: "Temporary UX Check", accounts: { create: { accountId: userId, providerId: "credential", password: await hashPassword(password) } } } });
    ids.push(user.id);
    const other = await db.user.create({ data: { email: `ux-${randomUUID()}@example.invalid`, name: "Temporary Isolation Check" } }); ids.push(other.id);
    await db.enrollment.create({ data: { userId: user.id, courseId: course.id } });
    let state = (await courseState(user.id, course.slug))!;
    const lesson = state.lessons.find(item => item.id === state.current?.lessonId)!;
    assert(lesson, "A first available lesson is needed.");
    const lockedNode = state.nodes.find(node => node.type === "LESSON" && node.status === "locked");
    const locked = state.lessons.find(item => item.id === lockedNode?.lessonId);
    if (locked) { await assert.rejects(accessible(user.id, "LESSON", locked.slug)); checks.push("locked lesson rejected by access service"); }

    await setBookmark(user.id, { kind: "course", id: course.id, saved: true });
    await setBookmark(user.id, { kind: "course", id: course.id, saved: true });
    assert.equal(await db.courseBookmark.count({ where: { userId: user.id, courseId: course.id } }), 1);
    await setBookmark(user.id, { kind: "lesson", id: lesson.id, saved: true });
    await setBookmark(other.id, { kind: "course", id: course.id, saved: true });
    await setBookmark(other.id, { kind: "course", id: course.id, saved: false });
    assert.equal(await db.courseBookmark.count({ where: { userId: user.id } }), 1);
    assert.equal(await db.lessonBookmark.count({ where: { userId: other.id } }), 0);
    checks.push("course/lesson bookmarks persist; duplicate saves stay unique; users isolated");

    const login = await fetch(`${origin}/api/auth/sign-in/email`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify({ email, password }) });
    assert.equal(login.status, 200, "Temporary student sign-in");
    const cookie = login.headers.getSetCookie().map(item => item.split(";")[0]).join("; ");
    assert(cookie);
    async function page(path: string) {
      const result = await fetch(origin + path, { headers: { cookie }, redirect: "manual" });
      assert.equal(result.status, 200, `HTTP ${path}`); return result.text();
    }
    for (const path of ["/", "/courses", `/courses/${course.slug}`, "/dashboard", "/roadmap", "/achievements", "/profile"]) await page(path);
    let bookmarks = await page("/bookmarks");
    assert(bookmarks.includes(`/courses/${course.slug}`)); assert(bookmarks.includes(`/learn/${lesson.slug}`));
    const lessonHtml = await page(`/learn/${lesson.slug}`);
    assert(lessonHtml.includes(`#module-${state.course.modules.find(m => m.id === lesson.moduleId)!.order}`));
    assert(lessonHtml.includes("Bookmark lesson") || lessonHtml.includes("Remove lesson bookmark"));
    if (locked) { const html = await page(`/learn/${locked.slug}`); assert(html.includes("Lesson Locked")); assert(!html.includes('class="lesson-player')); }
    checks.push("production HTTP student routes, saved destinations, breadcrumb and locked UI render");

    await db.lessonProgress.create({ data: { userId: user.id, lessonId: lesson.id, status: "COMPLETED", completedAt: new Date() } });
    assert(await accessible(user.id, "LESSON", lesson.slug));
    state = (await courseState(user.id, course.slug))!;
    assert(moduleViews(state).flatMap(m => m.lessons).some(item => item.href === `/learn/${lesson.slug}` && item.status === "completed"));
    const reopened = await page(`/learn/${lesson.slug}`); assert(reopened.includes("Completed"));
    checks.push("completed lesson stays accessible in service, course navigation and production HTTP");

    const bytes = await sharp({ create: { width: 64, height: 64, channels: 3, background: "red" } }).jpeg().toBuffer();
    const avatar = await normalizeAvatar(`data:image/jpeg;base64,${bytes.toString("base64")}`);
    await db.user.update({ where: { id: user.id }, data: { avatarUrl: avatar } });
    assert.equal((await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { avatarUrl: true } })).avatarUrl, avatar);
    assert((await page("/profile")).includes("data:image/webp;base64,"));
    checks.push("normalized avatar persists in DB and renders after profile request");

    await setBookmark(user.id, { kind: "course", id: course.id, saved: false });
    await setBookmark(user.id, { kind: "lesson", id: lesson.id, saved: false });
    bookmarks = await page("/bookmarks"); assert(bookmarks.includes("No bookmarks yet."));
    assert.equal(await db.courseBookmark.count({ where: { userId: user.id } }), 0);
    assert.equal(await db.lessonBookmark.count({ where: { userId: user.id } }), 0);
    assert(await db.course.findUnique({ where: { id: course.id } })); assert(await db.lesson.findUnique({ where: { id: lesson.id } }));
    checks.push("removal persists, empty state renders, course and lesson remain intact");

    const logout = await fetch(`${origin}/api/auth/sign-out`, { method: "POST", headers: { cookie, Origin: origin, "Content-Type": "application/json" }, body: "{}" });
    assert.equal(logout.status, 200);
    const blocked = await fetch(`${origin}/bookmarks`, { headers: { cookie }, redirect: "manual" });
    const blockedHtml = await blocked.text();
    const redirected = [303, 307].includes(blocked.status) && blocked.headers.get("location")?.includes("/login");
    const streamedRedirect = blocked.status === 200 && blockedHtml.includes("NEXT_REDIRECT") && blockedHtml.includes("/login");
    assert(redirected || streamedRedirect, "Signed-out bookmarks redirects to login");
    assert.equal(await db.session.count({ where: { userId: user.id } }), 0);
    checks.push("sign-out revokes session; bookmarks requires login");
    console.log(JSON.stringify({ passed: checks }, null, 2));
  } catch (error) { console.log(JSON.stringify({ completedChecks: checks })); throw error;
  } finally {
    for (const id of ids) await cleanup(id);
    console.log(`Temporary users cleaned: ${ids.length}`);
    await db.$disconnect();
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Student UX check failed"); process.exitCode = 1; });
