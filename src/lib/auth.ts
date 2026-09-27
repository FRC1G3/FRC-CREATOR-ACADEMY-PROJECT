import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getPrisma } from "./prisma";
import { hashPassword, verifyPassword } from "./password";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { allowAuthAttempt } from "./auth-throttle";
import { emailSchema, passwordSchema } from "./validation";

function createAuth() {
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) throw new Error("Authentication is not configured.");
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    advanced: { database: { joins: true } },
    baseURL: process.env.BETTER_AUTH_URL,
    database: prismaAdapter(getPrisma(), { provider: "postgresql", transaction: true }),
    emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 72, autoSignIn: false, password: { hash: hashPassword, verify: verifyPassword } },
    user: { fields: { image: "avatarUrl" }, additionalFields: { bio: { type: "string", required: false, input: false }, role: { type: ["STUDENT", "ADMIN"], defaultValue: "STUDENT", input: false } } },
    databaseHooks: { user: { create: { before: async user => ({ data: { ...user, role: "STUDENT" as const } }) } } },
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
