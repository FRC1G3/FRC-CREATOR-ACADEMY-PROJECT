import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(10).max(72).refine(value => new TextEncoder().encode(value).length <= 72, "Password is too long.");
export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
export const registerSchema = loginSchema.extend({ name: z.string().trim().min(2).max(100), confirmPassword: z.string() }).refine(value => value.password === value.confirmPassword, { message: "Passwords must match." });
export const profileSchema = z.object({ name: z.string().trim().min(2).max(100), bio: z.string().trim().max(1000), avatarUrl: z.string().trim().max(2000).refine(value => !value || /^https:\/\//.test(value) || /^\/(?!\/)[\w/.-]+$/.test(value), "Use an HTTPS image URL or a local image path.") });
export const idSchema = z.string().min(1).max(150);
export const quizSubmissionSchema = z.object({ quizId: idSchema, requestId: z.string().uuid(), answers: z.array(z.object({ questionId: idSchema, optionId: idSchema }).strict()).min(1).max(200) }).strict();
export type ActionState = { error?: string; success?: string };

export function safeCallback(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\s]/.test(value)) return fallback;
  try { const url = new URL(value, "https://academy.invalid"); return url.origin === "https://academy.invalid" && !["/login", "/register"].includes(url.pathname) ? url.pathname + url.search : fallback; } catch { return fallback; }
}
