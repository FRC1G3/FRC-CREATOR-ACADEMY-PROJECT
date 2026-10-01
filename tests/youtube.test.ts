import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { youtubeScope } from "../src/lib/oauth";
import { parseChannels } from "../src/lib/youtube-channel";

const m = vi.hoisted(() => ({ available: vi.fn(), account: vi.fn(), find: vi.fn(), upsert: vi.fn(), remove: vi.fn(), invalidate: vi.fn(), lock: vi.fn(), token: vi.fn(), fetch: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/google-config", () => ({ googleAvailable: m.available }));
vi.mock("@/lib/auth", () => ({ getAuth: () => ({ api: { getAccessToken: m.token } }) }));
vi.mock("@/lib/prisma", () => {
  const tx = { $queryRaw: m.lock, account: { findFirst: m.account }, youTubeConnection: { findUnique: m.find, upsert: m.upsert, deleteMany: m.remove, updateMany: m.invalidate } };
  return { getPrisma: () => ({ ...tx, $transaction: async (callback: (value: typeof tx) => Promise<unknown>) => callback(tx) }) };
});
import { ownChannels, syncYouTube, storedChannel, refreshChannel, removeChannel, youtubeFailure } from "../src/services/youtube";
const id = "UC" + "a".repeat(22), otherId = "UC" + "b".repeat(22);
function response(channelId = id) { return { id: channelId, snippet: { title: "Real channel", customUrl: "@creator", thumbnails: { high: { url: "https://yt3.googleusercontent.com/channel.jpg" } } }, statistics: { subscriberCount: "9007199254740993", videoCount: "12", viewCount: "9876543210", hiddenSubscriberCount: false } }; }
function serve(items = [response()], status = 200) { m.fetch.mockResolvedValue(new Response(JSON.stringify({ items }), { status })); }
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("fetch", m.fetch); m.available.mockReturnValue(true);
  m.account.mockResolvedValue({ id: "local-account", scope: youtubeScope });
  m.token.mockResolvedValue({ accessToken: "private-mock-token", scopes: [youtubeScope], accessTokenExpiresAt: new Date(Date.now() + 60000) });
  m.find.mockResolvedValue(null); m.upsert.mockResolvedValue({}); m.remove.mockResolvedValue({ count: 1 }); serve();
});
afterEach(() => vi.unstubAllGlobals());
it("persists a valid owned channel with lossless counts and no OAuth secrets", async () => {
  expect(await syncYouTube("u", "local-account")).toEqual({ choose: false });
  expect(m.token).toHaveBeenCalledWith({ headers: expect.any(Headers), body: { accountId: "local-account" } });
  expect(m.account).toHaveBeenCalledWith({ where: { id: "local-account", userId: "u", providerId: "google" }, select: { id: true, scope: true } });
  const write = m.upsert.mock.calls[0][0]; expect(write.where).toEqual({ userId: "u" });
  expect(write.create).toMatchObject({ userId: "u", channelId: id, googleAccountId: "local-account", subscriberCount: BigInt("9007199254740993"), lastSyncedAt: expect.any(Date) });
  for (const field of ["accessToken", "refreshToken", "idToken", "accessTokenEncrypted", "refreshTokenEncrypted"]) expect(write.create).not.toHaveProperty(field);
  const [url, options] = m.fetch.mock.calls[0];
  expect(url).toBe("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true&maxResults=50");
  expect(options).toMatchObject({ cache: "no-store", headers: { Authorization: "Bearer private-mock-token" }, signal: expect.any(AbortSignal) });
});
it("returns no-channel without creating an invented connection", async () => { serve([]); await expect(syncYouTube("u", "local-account")).rejects.toMatchObject({ code: "no-channel" }); expect(m.upsert).not.toHaveBeenCalled(); });
it.each([{}, { items: [{ ...response(), statistics: { subscriberCount: "-1" } }] }, { items: [{ ...response(), statistics: { viewCount: "9223372036854775808" } }] }, { items: [{ ...response(), snippet: { title: "", thumbnails: {} } }] }])("sanitizes malformed channel data", async payload => {
  m.fetch.mockResolvedValue(new Response(JSON.stringify(payload))); await expect(syncYouTube("u", "local-account")).rejects.toMatchObject({ code: "malformed" }); expect(m.upsert).not.toHaveBeenCalled();
});
it.each([401, 403])("handles HTTP %s with safe reconnect feedback", async status => { serve([], status); try { await syncYouTube("u", "local-account"); throw Error("Expected failure"); } catch (error) { expect(youtubeFailure(error)).toMatchObject({ reconnect: true }); expect(youtubeFailure(error).error).not.toContain("private"); } });
it("distinguishes API/quota configuration failures from an expired grant", async () => { m.fetch.mockResolvedValue(new Response(JSON.stringify({ error: { errors: [{ reason: "accessNotConfigured" }] } }), { status: 403 })); await expect(ownChannels("u", "local-account")).rejects.toMatchObject({ code: "unavailable" }); });
it("handles timeout/network failure without returning provider payloads", async () => { m.fetch.mockRejectedValue(Error("private-mock-token")); try { await syncYouTube("u", "local-account"); } catch (error) { expect(youtubeFailure(error).error).not.toContain("private-mock-token"); } });
it("refuses another user's account before retrieving any token", async () => { m.account.mockResolvedValue(null); await expect(syncYouTube("different-user", "local-account")).rejects.toMatchObject({ code: "reconnect" }); expect(m.token).not.toHaveBeenCalled(); expect(m.upsert).not.toHaveBeenCalled(); });
it("fails closed if readonly permission is missing", async () => { m.account.mockResolvedValue({ id: "local-account", scope: "email profile openid" }); await expect(syncYouTube("u", "local-account")).rejects.toMatchObject({ code: "reconnect" }); expect(m.fetch).not.toHaveBeenCalled(); });
it("remains safe when Google configuration is absent", async () => { m.available.mockReturnValue(false); await expect(ownChannels("u", "local-account")).rejects.toMatchObject({ code: "unavailable" }); expect(m.token).not.toHaveBeenCalled(); });
it("refreshes metadata while preserving the original connected date", async () => {
  m.find.mockResolvedValue({ googleAccountId: "local-account", channelId: id }); await refreshChannel("u");
  expect(m.upsert.mock.calls[0][0].update).toMatchObject({ lastSyncedAt: expect.any(Date), channelId: id });
  expect(m.upsert.mock.calls[0][0].update).not.toHaveProperty("createdAt");
});
it("does not resurrect a connection removed while refresh was in flight", async () => { m.find.mockResolvedValueOnce({ googleAccountId: "local-account", channelId: id }).mockResolvedValueOnce(null); await expect(refreshChannel("u")).rejects.toMatchObject({ code: "removed" }); expect(m.upsert).not.toHaveBeenCalled(); });
it("invalid grants stop advertising the unchanged channel as connected, guarding a newer connection", async () => { const updatedAt = new Date("2026-10-01"); m.find.mockResolvedValue({ googleAccountId: "local-account", channelId: id, updatedAt }); serve([], 401); await expect(refreshChannel("u")).rejects.toMatchObject({ code: "reconnect" }); expect(m.invalidate).toHaveBeenCalledWith({ where: { userId: "u", googleAccountId: "local-account", channelId: id, updatedAt }, data: { googleAccountId: null } }); });
it("requires an explicit choice when mine=true returns multiple channels", async () => { serve([response(), response(otherId)]); expect(await syncYouTube("u", "local-account")).toEqual({ choose: true }); expect(m.upsert).not.toHaveBeenCalled(); });
it("will not connect a chosen channel outside the authenticated result", async () => { await expect(syncYouTube("u", "local-account", otherId)).rejects.toMatchObject({ code: "removed" }); expect(m.upsert).not.toHaveBeenCalled(); });
it("allows a chosen owned channel and uses a unique user upsert on repeated sync", async () => { serve([response(), response(otherId)]); await syncYouTube("u", "local-account", otherId); serve([response(), response(otherId)]); await syncYouTube("u", "local-account", otherId); expect(m.upsert).toHaveBeenCalledTimes(2); expect(m.upsert.mock.calls.map(([data]) => data.where)).toEqual([{ userId: "u" }, { userId: "u" }]); });
it("normal Profile reads only stored metadata, excluding provider secrets", async () => {
  m.find.mockResolvedValue({ ...parseChannels({ items: [response()] })[0], subscriberCount: BigInt("9007199254740993"), videoCount: BigInt(12), viewCount: BigInt(100), createdAt: new Date("2026-10-01"), lastSyncedAt: new Date("2026-10-01"), googleAccount: { userId: "u", providerId: "google", scope: youtubeScope }, accessToken: "private" });
  const channel = await storedChannel("u"); expect(channel?.subscriberCount).toBe("9007199254740993"); expect(JSON.stringify(channel)).not.toMatch(/private|scope|googleAccount/); expect(m.fetch).not.toHaveBeenCalled(); expect(m.token).not.toHaveBeenCalled();
});
it.each([null, { userId: "other", providerId: "google", scope: youtubeScope }, { userId: "u", providerId: "google", scope: "openid" }])("does not display unverified/foreign legacy connections", async googleAccount => { m.find.mockResolvedValue({ googleAccount }); expect(await storedChannel("u")).toBeNull(); });
it("represents hidden or missing subscriber statistics honestly", () => { const item = response(); item.statistics.hiddenSubscriberCount = true; expect(parseChannels({ items: [item] })[0].subscriberCount).toBeNull(); expect(parseChannels({ items: [{ ...item, statistics: {} }] })[0].subscriberCount).toBeNull(); });
it("local removal deletes only the current user's channel metadata", async () => { await removeChannel("current-user"); expect(m.remove).toHaveBeenCalledWith({ where: { userId: "current-user" } }); expect(m.account).not.toHaveBeenCalled(); expect(m.token).not.toHaveBeenCalled(); expect(m.fetch).not.toHaveBeenCalled(); });
