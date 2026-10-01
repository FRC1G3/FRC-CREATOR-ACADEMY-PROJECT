import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { getPrisma } from "../src/lib/prisma";
import { storedChannel, removeChannel } from "../src/services/youtube";
import { youtubeScope } from "../src/lib/oauth";

config({ quiet: true });
async function main() {
  if (process.env.RUN_YOUTUBE_DB_CHECK !== "1") { console.log("Skipped: set RUN_YOUTUBE_DB_CHECK=1 for isolated metadata verification."); return; }
  const db = getPrisma(), userId = `youtube-check-${randomUUID()}`, otherId = `youtube-check-${randomUUID()}`;
  let stage = "create isolated fixtures";
  try {
    await db.user.create({ data: { id: userId, name: "Isolated metadata test", email: `${userId}@example.invalid`, role: "STUDENT", accounts: { create: [{ providerId: "google", accountId: userId, scope: youtubeScope }, { providerId: "credential", accountId: userId }] } } });
    await db.user.create({ data: { id: otherId, name: "Isolated ownership test", email: `${otherId}@example.invalid` } });
    const account = await db.account.findFirstOrThrow({ where: { userId, providerId: "google" }, select: { id: true } });
    stage = "metadata uniqueness and projections";
    const data = { userId, googleAccountId: account.id, channelId: "UC" + "z".repeat(22), channelTitle: "Isolated fixture channel", thumbnailUrl: "https://yt3.googleusercontent.com/fixture.jpg", customUrl: "@fixture", subscriberCount: BigInt("9007199254740993"), videoCount: BigInt(12), viewCount: BigInt("9007199254740995"), lastSyncedAt: new Date() };
    await db.youTubeConnection.upsert({ where: { userId }, create: data, update: data });
    await db.youTubeConnection.upsert({ where: { userId }, create: data, update: { channelTitle: "Updated isolated fixture" } });
    assert.equal(await db.youTubeConnection.count({ where: { userId } }), 1);
    const channel = await storedChannel(userId);
    assert.equal(channel?.channelTitle, "Updated isolated fixture"); assert.equal(channel?.subscriberCount, "9007199254740993");
    assert.equal(JSON.stringify(channel).includes("googleAccount"), false);
    assert.equal(await storedChannel(otherId), null);
    await db.youTubeConnection.update({ where: { userId }, data: { hiddenSubscriberCount: true } });
    assert.equal((await storedChannel(userId))?.subscriberCount, null);
    stage = "owned local removal preserves identities";
    await removeChannel(otherId); assert.equal(await db.youTubeConnection.count({ where: { userId } }), 1);
    await removeChannel(userId); assert.equal(await db.youTubeConnection.count({ where: { userId } }), 0);
    assert.equal(await db.account.count({ where: { userId } }), 2);
    assert.equal((await db.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } })).role, "STUDENT");
    console.log("PASS: additive metadata, lossless counts, unique sync, safe projection, ownership and local removal; no Google API called.");
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error && /^P\d{4}$/.test(String(error.code)) ? error.code : "verification failure";
    console.error(`FAILED at ${stage}: ${code}. Provider details suppressed.`); process.exitCode = 1;
  } finally {
    await db.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
    assert.equal(await db.user.count({ where: { id: { in: [userId, otherId] } } }), 0);
    console.log("Cleanup verified: only this run's isolated fixtures removed.");
    await db.$disconnect();
  }
}
main().catch(() => { console.error("Database verification unavailable; details suppressed."); process.exitCode = 1; });
