import "dotenv/config";
import assert from "node:assert/strict";
import { getPrisma } from "../src/lib/prisma";
import { TEMP_LESSON_VIDEO_URL } from "./video-default";
const db = getPrisma();
async function main() {
  assert.notEqual(process.env.NODE_ENV, "production");
  const before = await db.lesson.findMany({ orderBy: { id: "asc" } });
  console.log("Connected to configured DB; current lessons:", before.length);
  if (process.argv.includes("--apply")) {
    const result = await db.lesson.updateMany({ where: { id: { in: before.map(l => l.id) } }, data: { videoUrl: TEMP_LESSON_VIDEO_URL } });
    const after = await db.lesson.findMany({ orderBy: { id: "asc" } });
    const stable = (rows: typeof before) => rows.map(row => ({ ...row, videoUrl: null, updatedAt: null }));
    assert.deepEqual(stable(after), stable(before));
    assert.ok(after.every(l => l.videoUrl === TEMP_LESSON_VIDEO_URL));
    console.log("Updated video URLs only (plus automatic updatedAt):", result.count);
  }
  console.log("Lessons using supplied video:", await db.lesson.count({ where: { videoUrl: TEMP_LESSON_VIDEO_URL } }));
}
main().catch(() => { console.error("Video update/verification failed; connection details omitted."); process.exitCode = 1; }).finally(() => db.$disconnect());
