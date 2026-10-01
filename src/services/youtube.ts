import "server-only";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { googleAvailable } from "@/lib/google-config";
import { getPrisma } from "@/lib/prisma";
import { hasYouTubeScope } from "@/lib/oauth";
import { parseChannels, type YouTubeChannelData, type ConnectedChannel } from "@/lib/youtube-channel";
import type { Prisma } from "@/generated/prisma/client";

const messages = {
  unavailable: "YouTube is temporarily unavailable. Please try again later.",
  reconnect: "YouTube authorization is unavailable or expired. Please connect your channel again.",
  "no-channel": "No YouTube channel was found for this Google account. Try connecting another Google account.",
  malformed: "YouTube returned incomplete channel information. Please try again later.",
  choose: "Choose the YouTube channel you want to connect.",
  removed: "This channel connection changed. Please connect your channel again.",
};
export class YouTubeError extends Error {
  constructor(public code: keyof typeof messages) { super(messages[code]); }
}
export function youtubeFailure(error: unknown) {
  const code = error instanceof YouTubeError ? error.code : "unavailable";
  return { error: messages[code], reconnect: code === "reconnect" || code === "removed" };
}
const channelSelect = {
  channelId: true, channelTitle: true, thumbnailUrl: true, customUrl: true,
  subscriberCount: true, hiddenSubscriberCount: true, videoCount: true, viewCount: true, createdAt: true, lastSyncedAt: true,
  googleAccount: { select: { userId: true, providerId: true, scope: true } },
} satisfies Prisma.YouTubeConnectionSelect;
export async function storedChannel(userId: string): Promise<ConnectedChannel | null> {
  const row = await getPrisma().youTubeConnection.findUnique({ where: { userId }, select: channelSelect });
  // Legacy/mock rows have no verified provider provenance. Preserve them without advertising a fake connection.
  if (!row || row.googleAccount?.userId !== userId || row.googleAccount.providerId !== "google" || !hasYouTubeScope(row.googleAccount.scope)) return null;
  return { channelId: row.channelId, channelTitle: row.channelTitle, thumbnailUrl: row.thumbnailUrl, customUrl: row.customUrl,
    subscriberCount: row.hiddenSubscriberCount ? null : row.subscriberCount?.toString() ?? null, hiddenSubscriberCount: row.hiddenSubscriberCount,
    videoCount: row.videoCount?.toString() ?? null, viewCount: row.viewCount?.toString() ?? null,
    connectedAt: row.createdAt.toISOString(), lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null };
}
export async function ownChannels(userId: string, accountId: string | undefined) {
  if (!googleAvailable()) throw new YouTubeError("unavailable");
  if (!accountId || accountId.length > 200) throw new YouTubeError("reconnect");
  const account = await getPrisma().account.findFirst({ where: { id: accountId, userId, providerId: "google" }, select: { id: true, scope: true } });
  if (!account || !hasYouTubeScope(account.scope)) throw new YouTubeError("reconnect");
  let token;
  try {
    token = await getAuth().api.getAccessToken({ headers: await headers(), body: { accountId: account.id } });
    if (!token.accessToken || !token.scopes.includes("https://www.googleapis.com/auth/youtube.readonly") || (token.accessTokenExpiresAt && new Date(token.accessTokenExpiresAt).getTime() <= Date.now())) throw new Error("Unavailable authorization");
  } catch { throw new YouTubeError("reconnect"); }
  let response;
  try {
    response = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true&maxResults=50", {
      headers: { Authorization: `Bearer ${token.accessToken}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
  } catch { throw new YouTubeError("unavailable"); }
  if (response.status === 401) throw new YouTubeError("reconnect");
  if (response.status === 403) {
    const payload = await response.json().catch(() => null);
    const reason = payload?.error?.errors?.[0]?.reason;
    throw new YouTubeError(reason === "youtubeSignupRequired" ? "no-channel" : ["quotaExceeded", "dailyLimitExceeded", "accessNotConfigured", "forbidden"].includes(reason) ? "unavailable" : "reconnect");
  }
  if (!response.ok) throw new YouTubeError("unavailable");
  let channels;
  try { channels = parseChannels(await response.json()); } catch { throw new YouTubeError("malformed"); }
  if (!channels.length) throw new YouTubeError("no-channel");
  return channels;
}
async function persistChannel(userId: string, accountId: string, channel: YouTubeChannelData, refresh: boolean) {
  const db = getPrisma();
  await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const account = await tx.account.findFirst({ where: { id: accountId, userId, providerId: "google" }, select: { id: true, scope: true } });
    if (!account || !hasYouTubeScope(account.scope)) throw new YouTubeError("reconnect");
    const current = await tx.youTubeConnection.findUnique({ where: { userId }, select: { channelId: true, googleAccountId: true } });
    if (refresh && (!current || current.googleAccountId !== accountId || current.channelId !== channel.channelId)) throw new YouTubeError("removed");
    const data = { ...channel, googleAccountId: accountId,
      subscriberCount: channel.subscriberCount === null ? null : BigInt(channel.subscriberCount),
      videoCount: channel.videoCount === null ? null : BigInt(channel.videoCount), viewCount: channel.viewCount === null ? null : BigInt(channel.viewCount), lastSyncedAt: new Date() };
    const changed = current && (current.channelId !== channel.channelId || current.googleAccountId !== accountId);
    await tx.youTubeConnection.upsert({ where: { userId }, create: { ...data, userId }, update: { ...data, ...(changed ? { createdAt: new Date() } : {}) } });
  }, { timeout: 30000 });
}
export async function syncYouTube(userId: string, accountId: string | undefined, chosenId?: string) {
  const channels = await ownChannels(userId, accountId);
  if (!chosenId && channels.length > 1) return { choose: true as const };
  const channel = chosenId ? channels.find(c => c.channelId === chosenId) : channels[0];
  if (!channel) throw new YouTubeError("removed");
  await persistChannel(userId, accountId!, channel, false);
  return { choose: false as const };
}
export async function refreshChannel(userId: string) {
  const connection = await getPrisma().youTubeConnection.findUnique({ where: { userId }, select: { googleAccountId: true, channelId: true, updatedAt: true } });
  if (!connection?.googleAccountId) throw new YouTubeError("reconnect");
  try {
    const channels = await ownChannels(userId, connection.googleAccountId);
    const channel = channels.find(c => c.channelId === connection.channelId);
    if (!channel) throw new YouTubeError("no-channel");
    await persistChannel(userId, connection.googleAccountId, channel, true);
  } catch (error) {
    if (error instanceof YouTubeError && ["reconnect", "no-channel"].includes(error.code)) {
      // Keep metadata/login methods; invalid authorization is no longer presented as connected.
      await getPrisma().$transaction(async tx => {
        await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
        // A newer successful connection must not be invalidated by an older failed refresh.
        await tx.youTubeConnection.updateMany({ where: { userId, googleAccountId: connection.googleAccountId, channelId: connection.channelId, updatedAt: connection.updatedAt }, data: { googleAccountId: null } });
      });
    }
    throw error;
  }
}
export async function removeChannel(userId: string) {
  await getPrisma().$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    await tx.youTubeConnection.deleteMany({ where: { userId } });
  });
}
