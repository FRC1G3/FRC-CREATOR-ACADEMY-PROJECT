import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { BetterAuthOptions } from "better-auth";
import { google } from "better-auth/social-providers";
import { googleAvailable, googleProviders } from "../src/lib/google-config";
import { googleCallback, socialDestination, youtubeScope, youtubeAccountCookie } from "../src/lib/oauth";

const mock = vi.hoisted(() => ({ create: vi.fn(), handler: vi.fn() }));
vi.mock("better-auth", () => ({ betterAuth: (options: BetterAuthOptions) => { mock.create(options); return { handler: mock.handler }; } }));
vi.mock("better-auth/adapters/prisma", () => ({ prismaAdapter: () => ({}) }));
vi.mock("better-auth/next-js", () => ({ nextCookies: () => ({ id: "test-cookies" }) }));
vi.mock("@/lib/prisma", () => ({ getPrisma: () => ({}) }));
beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-only-for-mocked-auth-configuration"); vi.stubEnv("GOOGLE_CLIENT_ID", ""); vi.stubEnv("GOOGLE_CLIENT_SECRET", ""); });
afterEach(() => vi.unstubAllEnvs());
async function options() { const { getAuth } = await import("../src/lib/auth"); getAuth(); return mock.create.mock.calls[0][0] as BetterAuthOptions; }
it("omits Google safely without both credentials, retaining password sign-in", async () => {
  expect(googleAvailable()).toBe(false); expect(googleProviders()).toEqual({});
  vi.stubEnv("GOOGLE_CLIENT_ID", "mock-client"); expect(googleAvailable()).toBe(false);
  expect((await options()).emailAndPassword).toMatchObject({ enabled: true, minPasswordLength: 8, autoSignIn: false });
});
it("enables identity-only Google configuration without overwriting edited profiles", async () => {
  vi.stubEnv("GOOGLE_CLIENT_ID", "mock-client"); vi.stubEnv("GOOGLE_CLIENT_SECRET", "mock-secret");
  expect(googleAvailable()).toBe(true);
  const config = await options();
  expect(config.socialProviders).toEqual({ google: { clientId: "mock-client", clientSecret: "mock-secret", accessType: "online", includeGrantedScopes: false, overrideUserInfoOnSignIn: false } });
  expect(config.account).toMatchObject({ encryptOAuthTokens: true, accountLinking: { enabled: true, disableImplicitLinking: true, updateUserInfoOnLink: false } });
});
it("installed Google provider requests identity only for normal login", async () => {
  const provider = google({ clientId: "mock-client", clientSecret: "mock-secret", accessType: "online", includeGrantedScopes: false });
  const url = await provider.createAuthorizationURL({ state: "mock-state", codeVerifier: "mock-verifier", redirectURI: "http://localhost:3000/api/auth/callback/google" });
  expect(url.searchParams.get("scope")?.split(" ").sort()).toEqual(["email", "openid", "profile"]);
  expect(url.searchParams.get("access_type")).toBe("online"); expect(url.searchParams.get("prompt")).not.toBe("consent");
});
it("installed provider supports call-specific read-only, offline, consent authorization", async () => {
  const provider = google({ clientId: "mock-client", clientSecret: "mock-secret", accessType: "online", includeGrantedScopes: false });
  const url = await provider.createAuthorizationURL({ state: "mock-state", codeVerifier: "mock-verifier", redirectURI: "http://localhost:3000/api/auth/callback/google", scopes: [youtubeScope], additionalParams: { access_type: "offline", prompt: "consent select_account", include_granted_scopes: "true" } });
  expect(url.searchParams.get("scope")?.split(" ").sort()).toEqual(["email", youtubeScope, "openid", "profile"].sort());
  expect(url.searchParams.get("access_type")).toBe("offline"); expect(url.searchParams.get("prompt")).toBe("consent select_account");
});
it("Google signup discards a forged ADMIN role", async () => {
  const config = await options(), hook = config.databaseHooks!.user!.create!.before!;
  const result = await hook({ id: "new", name: "Creator", email: "creator@example.test", emailVerified: true, createdAt: new Date(), updatedAt: new Date(), role: "ADMIN" }, null);
  expect(result).toMatchObject({ data: { role: "STUDENT" } });
});
it.each(["ADMIN", "STUDENT"])("OAuth updates cannot replace existing %s authorization", async role => {
  const config = await options(), hook = config.databaseHooks!.user!.update!.before!;
  const context = { path: "/callback/google" } as Parameters<typeof hook>[1];
  const result = await hook({ name: "Creator", role: role === "ADMIN" ? "STUDENT" : "ADMIN" }, context);
  expect(result).toEqual({ data: { name: "Creator" } });
  expect({ role, ...(typeof result === "object" ? result.data : {}) }.role).toBe(role);
  expect(config.account?.accountLinking?.updateUserInfoOnLink).toBe(false);
});
it.each(["https://evil.test", "//evil.test", "/api/auth/get-access-token", "/auth/complete", "/profile/youtube/complete", "/login", "/register", "/\\evil.test"])("rejects unsafe sign-in callback %s", value => {
  expect(socialDestination(value)).toBe("/dashboard"); expect(googleCallback(value)).toBe("/auth/complete?next=%2Fdashboard");
});
it("keeps an internal course destination", () => { expect(googleCallback("/courses/mastery?lesson=one")).toBe("/auth/complete?next=%2Fcourses%2Fmastery%3Flesson%3Done"); });
it("callback bookkeeping contains only the local account ID, never OAuth tokens", async () => {
  const config = await options(), hook = config.databaseHooks!.account!.create!.after!, setCookie = vi.fn();
  const account = { id: "owned-local-record", providerId: "google", scope: youtubeScope, accessToken: "private-access", refreshToken: "private-refresh" } as Parameters<typeof hook>[0];
  await hook(account, { path: "/callback/google", setCookie } as unknown as Parameters<typeof hook>[1]);
  expect(setCookie).toHaveBeenCalledWith(youtubeAccountCookie, "owned-local-record", expect.objectContaining({ httpOnly: true, path: "/profile/youtube", sameSite: "lax", maxAge: 600 }));
  expect(JSON.stringify(setCookie.mock.calls)).not.toMatch(/private-access|private-refresh/);
  setCookie.mockClear(); await hook({ ...account, scope: "email profile openid" }, { path: "/callback/google", setCookie } as unknown as Parameters<typeof hook>[1]);
  expect(setCookie).not.toHaveBeenCalled();
});
