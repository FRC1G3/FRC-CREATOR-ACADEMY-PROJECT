import "dotenv/config";
import assert from "node:assert/strict";
import { getPrisma } from "../src/lib/prisma";
import { reconcileCourseEnrollments } from "../src/services/learning";

// Run with: node --conditions=react-server --import tsx prisma/reconcile-completion.ts --apply
// Explicit maintenance command for pre-existing dates / curriculum changed outside Admin.
const db = getPrisma();
async function main() {
  assert.notEqual(process.env.NODE_ENV, "production", "Development maintenance only.");
  assert.ok(process.argv.includes("--apply"), "Pass --apply to reconcile current completion dates.");
  const history = async () => ({
    progress: await db.lessonProgress.findMany({ orderBy: { id: "asc" } }),
    attempts: await db.quizAttempt.findMany({ orderBy: { id: "asc" } }),
    answers: await db.quizAnswer.findMany({ orderBy: { id: "asc" } }),
    badges: await db.userBadge.findMany({ orderBy: { id: "asc" } }),
  });
  const before = await history();
  const enrollments = await db.enrollment.findMany({ orderBy: { id: "asc" } });
  const courses = await db.course.findMany({ select: { id: true }, orderBy: { id: "asc" } });
  for (const course of courses) await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "Course" WHERE "id" = ${course.id} FOR UPDATE`;
    await reconcileCourseEnrollments(course.id, tx);
  }, { timeout: 30000 });
  const after = await db.enrollment.findMany({ orderBy: { id: "asc" } });
  assert.deepEqual(after.map(({ completedAt: _date, ...row }) => { void _date; return row; }), enrollments.map(({ completedAt: _date, ...row }) => { void _date; return row; }));
  assert.deepEqual(await history(), before);
  console.log(JSON.stringify({ courses: courses.length, enrollments: after.length, completionDatesChanged: after.filter((e, index) => e.completedAt?.getTime() !== enrollments[index].completedAt?.getTime()).length, historyPreserved: true }));
}
main().catch(() => { console.error("Completion reconciliation failed. Inspect locally; credentials are not logged."); process.exitCode = 1; }).finally(() => db.$disconnect());
