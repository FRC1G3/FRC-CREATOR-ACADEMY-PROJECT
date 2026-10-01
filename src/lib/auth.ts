import "server-only";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getPrisma } from "./prisma";
import { hashPassword, verifyPassword } from "./password";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { allowAuthAttempt } from "./auth-throttle";
import { emailSchema, passwordSchema } from "./validation";
import { googleProviders } from "./google-config";
import { hasYouTubeScope, youtubeAccountCookie } from "./oauth";

type AccountAfterHook = NonNullable<NonNullable<NonNullable<NonNullable<BetterAuthOptions["databaseHooks"]>["account"]>["create"]>["after"]>;
// Bookkeeping only: Better Auth owns OAuth state/PKCE. Completion rechecks account ownership.
const rememberYouTubeAccount: AccountAfterHook = async (account, context) => {
  if (context?.path !== "/callback/google" || account.providerId !== "google" || !hasYouTubeScope(account.scope)) return;
  context.setCookie(youtubeAccountCookie, account.id, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/profile/youtube", maxAge: 600 });
};

function createAuth() {
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) throw new Error("Authentication is not configured.");
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    advanced: { database: { joins: true } },
    baseURL: process.env.BETTER_AUTH_URL,
    socialProviders: googleProviders(),
    // Explicit authenticated linking; never merge arbitrary identities by email.
    account: { encryptOAuthTokens: true, accountLinking: { enabled: true, disableImplicitLinking: true, allowDifferentEmails: true, updateUserInfoOnLink: false } },
    logger: { disabled: true }, // Provider exceptions can contain token material.
    onAPIError: { errorURL: "/auth/error" },
    database: prismaAdapter(getPrisma(), { provider: "postgresql", transaction: true }),
    emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 72, autoSignIn: false, password: { hash: hashPassword, verify: verifyPassword } },
    user: { fields: { image: "avatarUrl" }, additionalFields: { bio: { type: "string", required: false, input: false }, role: { type: ["STUDENT", "ADMIN"], defaultValue: "STUDENT", input: false } } },
    databaseHooks: {
      user: {
        create: { before: async user => ({ data: { ...user, role: "STUDENT" as const } }) },
        update: { before: async (user, context) => {
          if (!context?.path?.startsWith("/callback/")) return;
          const data = { ...user }; delete data.role;
          return { data };
        } },
      },
      account: { create: { after: rememberYouTubeAccount }, update: { after: rememberYouTubeAccount } },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, window: 60, max: 20 },
    hooks: { before: createAuthMiddleware(async context => {
      if (!["/sign-in/email", "/sign-up/email"].includes(context.path)) return;
      const email = emailSchema.safeParse(context.body?.email);
      const password = passwordSchema.safeParse(context.body?.password);
      if (!email.success || !password.success) throw new APIError("BAD_REQUEST", { message: "Invalid credentials." });
      context.body.email = email.data;
      if (!await allowAuthAttempt(email.data)) throw new APIError("TOO_MANY_REQUESTS", { message: "Please try again later." });
    }) },
    plugins: [nextCookies()],
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() { return instance ??= createAuth(); }
