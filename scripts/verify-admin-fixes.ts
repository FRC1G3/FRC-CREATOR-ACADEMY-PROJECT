// Opt-in Neon check. Only records created by this run are removed.
import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import sharp from "sharp";
import { getPrisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { executeAdmin } from "../src/services/admin";
import { filterAdminLessons } from "../src/lib/admin-lesson-filters";

async function main() {
  assert.equal(process.env.RUN_ADMIN_FIX_CHECK, "1", "Explicit opt-in required");
  const db = getPrisma(), token = randomUUID(), userId = randomUUID();
  const email = `admin-check-${token}@example.invalid`, password = randomUUID();
  const origin = process.env.ADMIN_CHECK_ORIGIN || "http://localhost:3000";
  let courseId: string | undefined;
  const badges: string[] = [];
  try {
    await db.user.create({ data: { id: userId, name: "Temporary Admin Check", email, role: "ADMIN", accounts: { create: { accountId: userId, providerId: "credential", password: await hashPassword(password) } } } });
    const login = await fetch(`${origin}/api/auth/sign-in/email`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify({ email, password }) });
    assert.equal(login.status, 200);
    const cookie = login.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
    assert(cookie);
    async function page(path: string) {
      const response = await fetch(origin + path, { headers: { cookie }, redirect: "manual" });
      assert.equal(response.status, 200); return response.text();
    }
    const jpeg = await sharp({ create: { width: 64, height: 36, channels: 3, background: "red" } }).jpeg().toBuffer();
    const course = await executeAdmin({ entity: "course", operation: "save", data: { title: `Admin Check ${token}`, slug: `admin-check-${token}`, level: "BEGINNER", status: "DRAFT", instructorName: "Test", thumbnailUrl: `data:image/jpeg;base64,${jpeg.toString("base64")}` } });
    courseId = course.id;
    assert((await db.course.findUniqueOrThrow({ where: { id: courseId } })).thumbnailUrl?.startsWith("data:image/webp;base64,"));
    assert((await page("/admin/lessons")).includes(`Admin Check ${token}`));
    assert((await page("/admin/lessons/new")).includes(`Admin Check ${token}`));
    console.log("PASS: course/image persist; empty course appears in filter and create dropdown");
    const courseModule = await executeAdmin({ entity: "module", operation: "save", data: { courseId, title: "Temporary module", order: 1 } });
    const data = { courseId, moduleId: courseModule.id, title: `Zulu ${token}`, slug: `zulu-${token}`, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", durationSeconds: 60, status: "DRAFT", order: "" };
    const first = await executeAdmin({ entity: "lesson", operation: "save", data });
    const second = await executeAdmin({ entity: "lesson", operation: "save", data: { ...data, title: `Alpha ${token}`, slug: `alpha-${token}` } });
    const rows = (await db.lesson.findMany({ where: { moduleId: courseModule.id }, orderBy: { order: "asc" } })).map(row => ({ ...row, courseId: courseId! }));
    assert.deepEqual(rows.map(row => row.order), [1, 2]);
    await assert.rejects(executeAdmin({ entity: "lesson", operation: "save", data: { ...data, slug: `collision-${token}`, order: 1 } }), /Unique constraint/);
    for (let refresh = 0; refresh < 2; refresh++) assert((await page("/admin/lessons")).includes(`Zulu ${token}`));
    const filters = { search: token, course: courseId, module: courseModule.id, status: "DRAFT", sort: "az" };
    assert.deepEqual(filterAdminLessons(rows, filters).map(row => row.id), [second.id, first.id]);
    assert.deepEqual(filterAdminLessons(rows, { ...filters, sort: "za" }).map(row => row.id), [first.id, second.id]);
    console.log("PASS: automatic order, duplicate-order rejection, correct relation, refreshed list and combined filters/sort");
    for (const [entity, id] of [["course", courseId], ["lesson", first.id]] as const) {
      await executeAdmin({ entity, id, operation: "publish", data: {} });
      const published = entity === "course" ? await db.course.findUniqueOrThrow({ where: { id } }) : await db.lesson.findUniqueOrThrow({ where: { id } });
      assert.equal(published.status, "PUBLISHED");
      await executeAdmin({ entity, id, operation: "unpublish", data: {} });
      const draft = entity === "course" ? await db.course.findUniqueOrThrow({ where: { id } }) : await db.lesson.findUniqueOrThrow({ where: { id } });
      assert.equal(draft.status, "DRAFT");
    }
    await executeAdmin({ entity: "lesson", id: first.id, operation: "save", data: { ...data, title: `Updated ${token}`, order: 1 } });
    assert.equal((await db.lesson.findUniqueOrThrow({ where: { id: first.id } })).title, `Updated ${token}`);
    await executeAdmin({ entity: "node", operation: "save", data: { courseId, type: "LESSON", title: "Temporary structural node", targetId: second.id } });
    await executeAdmin({ entity: "lesson", id: second.id, operation: "delete", data: {} });
    assert.equal(await db.roadmapNode.count({ where: { lessonId: second.id } }), 0);
    assert.equal(await db.lesson.count({ where: { id: second.id } }), 0);
    await db.lessonProgress.create({ data: { userId, lessonId: first.id, status: "COMPLETED", completedAt: new Date() } });
    await assert.rejects(executeAdmin({ entity: "lesson", id: first.id, operation: "delete", data: {} }), /learner history/);
    assert.equal(await db.lessonProgress.count({ where: { userId, lessonId: first.id } }), 1);
    await assert.rejects(executeAdmin({ entity: "course", id: courseId, operation: "delete", data: {} }), /content or learning history/);
    console.log("PASS: edit, publish/unpublish, safe structural delete and protected history");
    for (const icon of ["play", "star", "flame"]) {
      const badge = await executeAdmin({ entity: "badge", operation: "save", data: { name: `Check ${icon}`, slug: `${icon}-${token}`, icon, conditionType: "STREAK", conditionValue: 100000, status: "INACTIVE" } });
      badges.push(badge.id);
    }
    await executeAdmin({ entity: "badge", id: badges[1], operation: "save", data: { name: "Check star", slug: `star-${token}`, icon: "crown", conditionType: "STREAK", conditionValue: 100000, status: "INACTIVE" } });
    const icons = await Promise.all(badges.map(id => db.badge.findUniqueOrThrow({ where: { id }, select: { icon: true } })));
    assert.deepEqual(icons.map(row => row.icon), ["play", "crown", "flame"]);
    console.log("PASS: editing badge B leaves A/C unchanged in DB");
  } finally {
    await db.lessonProgress.deleteMany({ where: { userId } });
    await db.enrollment.deleteMany({ where: { userId } });
    if (courseId) {
      await db.roadmapNode.deleteMany({ where: { courseId } });
      await db.lesson.deleteMany({ where: { module: { courseId } } });
      await db.module.deleteMany({ where: { courseId } });
      await db.course.delete({ where: { id: courseId } });
    }
    await db.badge.deleteMany({ where: { id: { in: badges } } });
    await db.user.deleteMany({ where: { id: userId } });
    await db.authThrottle.deleteMany({ where: { key: createHash("sha256").update(email).digest("hex") } });
    console.log("Temporary fixtures removed.");
    await db.$disconnect();
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Admin check failed"); process.exitCode = 1; });
