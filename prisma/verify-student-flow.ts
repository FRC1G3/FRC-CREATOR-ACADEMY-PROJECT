import "dotenv/config";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { getPrisma } from "../src/lib/prisma";
import { roadmapStates } from "../src/lib/learning-rules";

// Opt-in live verification. This intentionally advances the demo student's history.
// Run against the local production build with --allow-progress. No history is deleted.
const base = "http://localhost:3000";
const manifest = JSON.parse(readFileSync(".next/server/server-reference-manifest.json", "utf8"));
const ids = Object.fromEntries(Object.entries(manifest.node).map(([id, entry]) => [(entry as { exportedName: string }).exportedName, id]));
const db = getPrisma();
let stage = "login";
class Client {
  cookies = new Map<string, string>();
  async request(path: string, init: RequestInit = {}) {
    const response = await fetch(base + path, { ...init, redirect: "manual", headers: { ...init.headers, cookie: [...this.cookies].map(([k,v]) => `${k}=${v}`).join("; "), origin: base } });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0], split = pair.indexOf("=");
      this.cookies.set(pair.slice(0, split), pair.slice(split + 1));
    }
    return { response, text: await response.text() };
  }
  async action(path: string, name: string, args: unknown[], fields?: Record<string, string>) {
    let body: BodyInit;
    const headers: Record<string,string> = { "Next-Action": ids[name], accept: "text/x-component" };
    if (fields) {
      const form = new FormData();
      for (const [key,value] of Object.entries(fields)) form.set(`_1_${key}`,value);
      form.set("0", JSON.stringify([{}, "$K1"]));
      body = form;
    } else { body = JSON.stringify(args); headers["content-type"] = "text/plain;charset=UTF-8"; }
    return this.request(path, { method: "POST", headers, body });
  }
  async login(email: string, destination: string) {
    const result = await this.action("/login", "authenticate", [], { mode: "login", email, password: process.env.SEED_PASSWORD!, remember: "on" });
    assert.ok(result.response.headers.get("x-action-redirect")?.startsWith(destination), `Login redirect failed (${result.response.status})`);
    console.log(`PASS ${email}: login redirects to ${destination}`);
  }
}
async function main() {
  assert.notEqual(process.env.NODE_ENV,"production");
  if (process.argv.includes("--inspect")) {
    stage = "read-only database verification";
    const user = await db.user.findUniqueOrThrow({ where: { email: "student@frc.academy" }, select: { id: true } });
    const course = await db.course.findUniqueOrThrow({ where: { slug: "youtube" }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } } } }, roadmapNodes: { orderBy: { order: "asc" } } } });
    const [progress, attempts, badges, enrollment] = await Promise.all([
      db.lessonProgress.findMany({ where: { userId: user.id, lesson: { module: { courseId: course.id } } } }),
      db.quizAttempt.findMany({ where: { userId: user.id, quiz: { courseId: course.id } }, include: { answers: true }, orderBy: { completedAt: "asc" } }),
      db.userBadge.findMany({ where: { userId: user.id }, include: { badge: { select: { slug: true } } } }),
      db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } }),
    ]);
    const completed = new Set(progress.filter(p => p.status === "COMPLETED").map(p => p.lessonId));
    assert.ok(progress.filter(p => p.status === "COMPLETED").every(p => p.completedAt));
    const nodes = roadmapStates(course.roadmapNodes,Boolean(enrollment),completed,new Set(attempts.filter(a => a.passed).map(a => a.quizId)),new Set(badges.map(b => b.badgeId)));
    assert.ok(nodes.filter(n => n.type === "LESSON" && completed.has(n.lessonId!)).every(n => n.status === "completed"));
    assert.ok(attempts.some(a => a.id === "seed-student-fundamentals-attempt-1" && a.passed));
    assert.ok(badges.some(b => b.badge.slug === "creator-starter"));
    const total = course.modules.reduce((sum,m) => sum + m.lessons.length,0);
    console.log("Read-only student state", { enrollment: Boolean(enrollment), lessonProgress: progress.length, completedLessons: completed.size, totalLessons: total, percentage: Math.round(completed.size / total * 100), quizAttempts: attempts.length, quizAnswers: attempts.reduce((sum,a) => sum + a.answers.length,0), badges: badges.map(b => b.badge.slug), roadmap: { completed: nodes.filter(n => n.status === "completed").length, available: nodes.filter(n => n.status === "current").length, locked: nodes.filter(n => n.status === "locked").length } });
    return;
  }
  assert.ok(process.argv.includes("--allow-progress"), "Explicit --allow-progress is required.");
  assert.ok(process.env.SEED_PASSWORD);
  const student = new Client(), admin = new Client();
  await student.login("student@frc.academy", "/dashboard");
  await admin.login("admin@frc.academy", "/admin");
  for (const path of ["/dashboard", "/courses/youtube", "/roadmap", "/profile", "/achievements"]) {
    const page = await student.request(path); assert.equal(page.response.status,200); assert.ok(!page.text.includes('"digest":'));
    console.log(`PASS authenticated ${path}`);
  }
  const denied = await student.request("/admin"); assert.equal(denied.response.headers.get("location"),"/dashboard");
  assert.equal((await admin.request("/admin")).response.status,200);
  console.log("PASS server-side admin authorization");
  const user = await db.user.findUniqueOrThrow({ where: { email: "student@frc.academy" }, select: { id: true, name: true, email: true, bio: true, avatarUrl: true } });
  const course = await db.course.findUniqueOrThrow({ where: { slug: "youtube" }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } }, quizzes: { include: { questions: { include: { options: true } } } } } });
  const originalEnrollment = await db.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: user.id, courseId: course.id } } });
  const originalAttempts = await db.quizAttempt.findMany({ where: { userId: user.id } });
  const originalBadges = await db.userBadge.findMany({ where: { userId: user.id } });
  const progress = (lessonId: string) => db.lessonProgress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId } } });
  const attemptIds: string[] = [];
  async function submit(moduleIndex: number, pass: boolean) {
    const quiz = course.quizzes.find(q => q.moduleId === course.modules[moduleIndex].id)!;
    const payload = { quizId: quiz.slug, requestId: crypto.randomUUID(), answers: quiz.questions.map(q => ({ questionId: q.id, optionId: q.options.find(o => o.isCorrect === pass)!.id })) };
    const publicPage = await student.request(`/quizzes/${quiz.slug}`);
    assert.equal(publicPage.response.status,200); assert.ok(!publicPage.text.includes('isCorrect')); assert.ok(publicPage.text.includes(quiz.questions[0].text));
    for (const field of ["score", "passed", "isCorrect", "userId"]) {
      const forged = await student.action(`/quizzes/${quiz.slug}`, "submitQuiz", [{ ...payload, [field]: "forged" }]);
      assert.ok(forged.text.includes("Answer every question"));
      assert.equal(await db.quizAttempt.count({ where: { id: payload.requestId } }),0);
    }
    const result = await student.action(`/quizzes/${quiz.slug}`, "submitQuiz", [payload]);
    assert.ok(result.text.includes("/result?attempt="), "Quiz action failed");
    const attempt = await db.quizAttempt.findUniqueOrThrow({ where: { id: payload.requestId }, include: { answers: true } });
    assert.equal(attempt.passed,pass); assert.equal(attempt.score,pass ? 100 : 0); assert.equal(attempt.answers.length,quiz.questions.length);
    attemptIds.push(attempt.id);
    const resultPath = `/quizzes/${quiz.slug}/result?attempt=${attempt.id}`;
    const resultPage = await student.request(resultPath);
    assert.ok(resultPage.text.includes(pass ? "Great Job!" : "Almost There!")); assert.ok(resultPage.text.includes("80"));
    const foreignResult = await admin.request(resultPath);
    assert.ok(foreignResult.response.status === 404 || foreignResult.text.includes('NEXT_HTTP_ERROR_FALLBACK;404'));
    await student.action(`/quizzes/${quiz.slug}`, "submitQuiz", [payload]);
    assert.equal(await db.quizAttempt.count({ where: { id: attempt.id } }),1);
    console.log(`PASS ${quiz.slug}: ${pass ? "pass" : "fail"}, answers persisted, private result, forged fields rejected, duplicate submission safe`);
  }
  for (const moduleIndex of [1,2]) {
    stage = `module ${moduleIndex + 1} lesson completion`;
    const courseModule = course.modules[moduleIndex];
    const nextLesson = course.modules[moduleIndex + 1].lessons[0];
    for (const lesson of courseModule.lessons) {
      const before = await progress(lesson.id);
      const opened = await student.request(`/learn/${lesson.slug}`); assert.ok(opened.text.includes(lesson.title));
      const started = await student.action(`/learn/${lesson.slug}`, "startLesson", [lesson.slug]); assert.equal(started.response.status,200);
      assert.equal((await progress(lesson.id))?.status,before?.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS");
      const completed = await student.action(`/learn/${lesson.slug}`, "completeLesson", [], { slug: lesson.slug });
      assert.ok(completed.text.includes("Lesson completed."), "Completion action failed");
      const stored = await progress(lesson.id); assert.equal(stored?.status,"COMPLETED"); assert.ok(stored.completedAt);
      await student.action(`/learn/${lesson.slug}`, "startLesson", [lesson.slug]);
      assert.deepEqual(await progress(lesson.id),stored);
      console.log(`PASS ${lesson.slug}: ${before?.status ?? "no progress"} -> IN_PROGRESS/COMPLETED; no regression`);
    }
    stage = `module ${moduleIndex + 1} quiz failure and unlock`;
    const previousPass = await db.quizAttempt.count({ where: { userId: user.id, quizId: course.quizzes.find(q => q.moduleId === courseModule.id)!.id, passed: true } });
    if (!previousPass) {
      assert.ok((await student.request(`/learn/${nextLesson.slug}`)).text.includes("unlock this lesson"));
      await submit(moduleIndex,false);
      assert.ok((await student.request(`/learn/${nextLesson.slug}`)).text.includes("unlock this lesson"));
      const blocked = await student.action(`/learn/${nextLesson.slug}`, "completeLesson", [], { slug: nextLesson.slug });
      assert.ok(blocked.text.includes("earlier roadmap"));
    }
    await submit(moduleIndex,true);
    assert.ok(!(await student.request(`/learn/${nextLesson.slug}`)).text.includes("unlock this lesson"));
    await submit(moduleIndex,false);
    assert.ok(!(await student.request(`/learn/${nextLesson.slug}`)).text.includes("unlock this lesson"));
    console.log(`PASS module ${moduleIndex + 1}: checkpoint blocks next module; pass unlocks; failed retry does not relock`);
  }
  stage = "badges, profile, refresh and logout";
  const quizMaster = await db.badge.findUniqueOrThrow({ where: { slug: "quiz-master" } });
  const award = await db.userBadge.findUniqueOrThrow({ where: { userId_badgeId: { userId: user.id, badgeId: quizMaster.id } } });
  await student.action(`/learn/${course.modules[2].lessons[2].slug}`, "completeLesson", [], { slug: course.modules[2].lessons[2].slug });
  assert.deepEqual(await db.userBadge.findUnique({ where: { userId_badgeId: { userId: user.id, badgeId: quizMaster.id } } }),award);
  assert.equal(await db.userBadge.count({ where: { userId: user.id, badgeId: quizMaster.id } }),1);
  for (const old of originalAttempts) assert.deepEqual(await db.quizAttempt.findUnique({ where: { id: old.id } }),old);
  for (const old of originalBadges) assert.deepEqual(await db.userBadge.findUnique({ where: { id: old.id } }),old);
  assert.deepEqual(await db.enrollment.findUnique({ where: { id: originalEnrollment.id } }),originalEnrollment);
  const saved = await student.action("/profile", "saveProfile", [], { name: user.name, bio: user.bio ?? "", avatarUrl: user.avatarUrl ?? "" });
  assert.ok(saved.text.includes("Profile saved."));
  const updated = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { name: true, bio: true } }); assert.equal(updated.bio,user.bio); assert.equal(updated.name,user.name);
  for (const path of ["/dashboard", "/courses/youtube", "/roadmap", "/profile", "/achievements"]) {
    const page = await student.request(path); assert.equal(page.response.status,200);
    if (path === "/profile") { assert.ok(page.text.includes(user.email)); assert.ok(page.text.includes("Not Connected")); }
    if (path === "/achievements") assert.ok(page.text.includes("Quiz Master"));
  }
  console.log("PASS badge awarded once, history preserved, profile save, refreshed student pages");
  console.log("Student DB counts", { enrollment: await db.enrollment.count({ where: { userId: user.id } }), progress: await db.lessonProgress.count({ where: { userId: user.id } }), attempts: await db.quizAttempt.count({ where: { userId: user.id } }), answers: await db.quizAnswer.count({ where: { attempt: { userId: user.id } } }), badges: await db.userBadge.count({ where: { userId: user.id } }), newAttempts: attemptIds.length });
  for (const client of [student,admin]) {
    const out = await client.action("/dashboard", "logout", []); assert.ok(out.response.headers.get("x-action-redirect")?.startsWith("/;"));
    const privatePage = await client.request("/dashboard"); assert.ok(privatePage.response.headers.get("location")?.startsWith("/login"));
  }
  console.log("PASS logout invalidates access; live student flow complete");
}
main().catch(() => { console.error(`FAIL live student verification at ${stage}; secrets and response bodies omitted.`); process.exitCode = 1; }).finally(() => db.$disconnect());
