import { validImageSource } from "./image-source";
import { AVATAR_MAX_DATA_LENGTH } from "./avatar";
import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(8, "Use at least 8 characters. Letters or numbers alone are enough.").max(72, "Use at most 72 characters.").refine(value => new TextEncoder().encode(value).length <= 72, "Password is too long (maximum 72 UTF-8 bytes).");
export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
export const registerSchema = loginSchema.extend({ name: z.string().trim().min(2, "Enter at least 2 characters for your name.").max(100, "Name must be at most 100 characters."), confirmPassword: z.string() }).refine(value => value.password === value.confirmPassword, { message: "Passwords must match.", path: ["confirmPassword"] });
export const profileSchema = z.object({ name: z.string().trim().min(2).max(100), bio: z.string().trim().max(1000), avatarUrl: z.string().trim().max(AVATAR_MAX_DATA_LENGTH).refine(value => !value || Boolean(validImageSource(value)), "Choose a valid profile photo.") });
export const idSchema = z.string().min(1).max(150);
export const quizSubmissionSchema = z.object({ quizId: idSchema, requestId: z.string().uuid(), answers: z.array(z.object({ questionId: idSchema, optionId: idSchema }).strict()).min(1).max(200) }).strict();
export type ActionState = { error?: string; success?: string; fieldErrors?: Record<string, string> };

export function safeCallback(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\s]/.test(value)) return fallback;
  try { const url = new URL(value, "https://academy.invalid"); return url.origin === "https://academy.invalid" && !["/login", "/register"].includes(url.pathname) ? url.pathname + url.search : fallback; } catch { return fallback; }
}
