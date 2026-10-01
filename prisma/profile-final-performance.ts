// Opt-in production HTTP harness using the existing ACADEMY_PERF instrumentation.
// Run: node --conditions=react-server --import tsx prisma/profile-final-performance.ts --before|--after
import "dotenv/config";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { getPrisma } from "../src/lib/prisma";
import { getAuth } from "../src/lib/auth";

type Span = { label: string; ms: number; queries: number; queryMs: number; startQueries: number; endQueries: number };
type Sample = { operation: string; sample: number; httpMs: number; bytes: number; sql: number; spans: Span[] };
const db = getPrisma(), base = "http://localhost:3019";
const stage = process.argv.includes("--after") ? "after" : "before";
const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8"));
const ids = Object.fromEntries(Object.entries(manifest.node).map(([id, value]) => [(value as { exportedName: string }).exportedName, id]));
const spans: Span[] = [], samples: Sample[] = [];
let cookie = "", output = "", phase = "startup";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3019"], { windowsHide: true, env: { ...process.env, PROFILE_PERFORMANCE: "1" }, stdio: ["ignore", "pipe", "pipe"] });
server.stdout.on("data", chunk => {
  output += chunk.toString();
  const lines = output.split(/\r?\n/); output = lines.pop()!;
  for (const line of lines) {
    const index = line.indexOf("ACADEMY_PERF ");
    if (index >= 0) try { spans.push(JSON.parse(line.slice(index + 13))); } catch { /* partial non-profiler output */ }
  }
});
// Do not relay raw server logs: auth errors may include private details.
server.stderr.on("data", () => {});

async function request(operation: string, sample: number, path: string, init: RequestInit = {}) {
  await new Promise(resolve => setTimeout(resolve, 20));
  phase = operation;
  if (sample === 0) console.log("Measuring " + operation);
  const offset = spans.length, start = performance.now();
  const response = await fetch(base + path, { ...init, redirect: "manual", headers: { ...init.headers, cookie, origin: base } });
  const text = await response.text(), httpMs = Math.round(performance.now() - start);
  await new Promise(resolve => setTimeout(resolve, 20));
  const logged = spans.slice(offset);
  const sql = logged.length ? Math.max(...logged.map(s => s.endQueries)) - Math.min(...logged.map(s => s.startQueries)) : 0;
  samples.push({ operation, sample, httpMs, bytes: Buffer.byteLength(text), sql, spans: logged });
  assert.equal(response.status, 200, operation + " HTTP status");
  return text;
}
function action(name: string, args: unknown[], fields?: Record<string, string>): RequestInit {
  const headers: Record<string, string> = { "Next-Action": ids[name], accept: "text/x-component" };
  assert.ok(headers["Next-Action"], "Missing production action reference");
  if (fields) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) form.set(`_1_${key}`, value);
    form.set("0", JSON.stringify([{}, "$K1"]));
    return { method: "POST", headers, body: form };
  }
  headers["content-type"] = "text/plain;charset=UTF-8";
  return { method: "POST", headers, body: JSON.stringify(args) };
}
async function main() {
  const userId = randomUUID(), courseId = randomUUID(), suffix = randomUUID(), token = randomUUID();
  try {
    for (let i = 0; i < 100; i++) {
      assert.equal(server.exitCode, null, "Profiling server exited");
      try { if ((await fetch(base + "/login")).ok) break; } catch { /* startup */ }
      await new Promise(resolve => setTimeout(resolve, 100));
      if (i === 99) throw new Error("Profiling server did not start");
    }
    phase = "create-isolated-user";
    await db.user.create({ data: { id: userId, name: "Isolated Final Performance", email: `${suffix}@example.invalid`, sessions: { create: { token, expiresAt: new Date(Date.now() + 3600000) } } } });
    phase = "sign-own-session";
    const context = await getAuth().$context;
    cookie = `${context.authCookies.sessionToken.name}=${encodeURIComponent(`${token}.${createHmac("sha256", context.secret).update(token).digest("base64")}`)}`;
    phase = "create-isolated-course";
    const course = await db.course.create({ data: { id: courseId, slug: `final-profile-${suffix}`, title: "Isolated Performance Course", shortDescription: "Fixture", description: "Fixture", instructorName: "Fixture", status: "PUBLISHED", modules: { create: [
      { title: "First Module", order: 1, lessons: { create: [1, 2, 3].map(n => ({ slug: `profile-${suffix}-${n}`, title: `Lesson ${n}`, description: "Fixture", durationSeconds: 60, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", order: n, status: "PUBLISHED" as const })) } },
      { title: "Next Module", order: 2, lessons: { create: { slug: `profile-${suffix}-4`, title: "Locked Lesson", description: "Fixture", durationSeconds: 60, videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", order: 1, status: "PUBLISHED" } } }
    ] }, enrollments: { create: { userId } } }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } } });
    const lessons = course.modules.flatMap(m => m.lessons), lesson = lessons[0];
    const quiz = await db.quiz.create({ data: { courseId, moduleId: course.modules[0].id, title: "Checkpoint", slug: `profile-quiz-${suffix}`, status: "PUBLISHED", questions: { create: Array.from({ length: 10 }, (_, i) => ({ text: `Question ${i}`, order: i + 1, options: { create: [{ text: "Correct", order: 1, isCorrect: true }, { text: "Wrong", order: 2, isCorrect: false }] } })) } }, include: { questions: { include: { options: true } } } });
    await db.roadmapNode.createMany({ data: [...lessons.slice(0, 3).map((l, i) => ({ courseId, lessonId: l.id, title: l.title, type: "LESSON" as const, order: i + 1 })), { courseId, quizId: quiz.id, title: "Checkpoint", type: "QUIZ", order: 4 }, { courseId, lessonId: lessons[3].id, title: "Locked Lesson", type: "LESSON", order: 5 }] });
    await db.courseBookmark.create({ data: { userId, courseId } });
    for (let i = 0; i < 4; i++) {
      await db.lessonProgress.deleteMany({ where: { userId } });
      const result = await request("Mark Complete", i, "/learn/" + lesson.slug, action("completeLesson", [], { slug: lesson.slug }));
      assert.ok(result.includes("Lesson completed."), "Completion rejected");
    }
    await db.lessonProgress.deleteMany({ where: { userId } });
    await db.lessonProgress.createMany({ data: lessons.slice(0, 3).map(l => ({ userId, lessonId: l.id, status: "COMPLETED", startedAt: new Date(), completedAt: new Date() })) });
    const answers = quiz.questions.map(q => ({ questionId: q.id, optionId: q.options.find(o => o.isCorrect)!.id }));
    for (let i = 0; i < 4; i++) {
      await db.quizAnswer.deleteMany({ where: { attempt: { userId } } });
      await db.quizAttempt.deleteMany({ where: { userId } });
      await db.userBadge.deleteMany({ where: { userId } });
      const requestId = randomUUID();
      const result = await request("Quiz Submit", i, "/quizzes/" + quiz.slug, action("submitQuiz", [{ quizId: quiz.slug, requestId, answers }]));
      if (!result.includes("/result?attempt=")) console.log(JSON.stringify({ diagnostic: "Quiz rejected", genericFailure: result.includes("Unable to submit"), lockFailure: result.includes("earlier roadmap"), logs: samples.at(-1)?.spans }));
      assert.ok(result.includes("/result?attempt="), "Quiz rejected");
      assert.equal(await db.quizAnswer.count({ where: { attemptId: requestId } }), 10);
      await request("Quiz Result", i, `/quizzes/${quiz.slug}/result?attempt=${requestId}`);
    }
    for (const [operation, path] of [
      ["Dashboard", "/dashboard"], ["Courses", "/courses"], ["Course Detail", "/courses/" + course.slug], ["Roadmap", "/roadmap?course=" + course.slug], ["Roadmap Default", "/roadmap"], ["Profile", "/profile"], ["Achievements", "/achievements"], ["Bookmarks", "/bookmarks"], ["Lesson", "/learn/" + lesson.slug]
    ]) for (let i = 0; i < 4; i++) await request(operation, i, path);
    await db.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
    for (const [operation, path] of [["Admin Dashboard", "/admin"], ["Admin Courses", "/admin/courses"], ["Admin Lessons", "/admin/lessons"], ["Admin Quizzes", "/admin/quizzes"], ["Admin Students", "/admin/students"]]) {
      for (let i = 0; i < 4; i++) {
        const html = await request(operation, i, path);
        assert.ok(html.includes('id="admin-sidebar"'), "Live promotion not honored");
      }
    }
    await db.user.update({ where: { id: userId }, data: { role: "STUDENT" } });
    const denied = await fetch(base + "/admin", { redirect: "manual", headers: { cookie } });
    assert.ok(!(await denied.text()).includes('id="admin-sidebar"'), "Stale admin session role");
    const probes: number[] = [];
    for (let i = 0; i < 4; i++) { const start = performance.now(); await db.$queryRaw`SELECT 1`; probes.push(Math.round(performance.now() - start)); }
    writeFileSync(`docs/final-performance-${stage}.json`, JSON.stringify({ note: "Sequential production HTTP; isolated four-lesson/10-question quiz course. Initial is first route/action use, not proven Neon cold start. Full body timings, not hydrated browser paint. SQL emitted statement counts include transaction statements; proxy, not packet counts. Quiz full flow is Submit HTTP plus Result HTTP. Fixtures reset before each mutation sample. Role promotion/demotion verified in same active session. Numeric aggregates only; fixtures removed.", samples, probes }, null, 2));
    console.log("PASS production profile: " + samples.length + " samples; same-session live role checks; ten persisted answers per submission.");
  } finally {
    try {
      phase += " / cleanup";
      await db.quizAnswer.deleteMany({ where: { attempt: { userId } } });
      await db.quizAttempt.deleteMany({ where: { userId } });
      await db.userBadge.deleteMany({ where: { userId } });
      await db.lessonProgress.deleteMany({ where: { userId } });
      await db.courseBookmark.deleteMany({ where: { userId } });
      await db.enrollment.deleteMany({ where: { userId } });
      await db.roadmapNode.deleteMany({ where: { courseId } });
      await db.course.deleteMany({ where: { id: courseId } });
      await db.user.deleteMany({ where: { id: userId } });
      assert.equal(await db.user.count({ where: { id: userId } }), 0);
      assert.equal(await db.course.count({ where: { id: courseId } }), 0);
      console.log("PASS isolated records cleaned up.");
    } finally { server.kill(); await db.$disconnect(); }
  }
}
main().catch(error => { console.error("Production profiling failed at " + phase + "; code " + (typeof error?.code === "string" ? error.code : "unavailable") + "; private error details omitted."); process.exitCode = 1; });
