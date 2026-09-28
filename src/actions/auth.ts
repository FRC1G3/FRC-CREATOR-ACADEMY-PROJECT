"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { APIError } from "better-auth/api";
import { loginSchema, registerSchema, safeCallback, type ActionState } from "@/lib/validation";

export async function authenticate(_: ActionState, data: FormData): Promise<ActionState> {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) return { error: "Sign-in and registration are unavailable until academy setup is complete." };
  const registering = data.get("mode") === "register";
  const values = { email: data.get("email"), password: data.get("password"), name: data.get("full-name"), confirmPassword: data.get("confirm-password") };
  const parsed = registering ? registerSchema.safeParse(values) : loginSchema.safeParse(values);
  if (!parsed.success) {
    if (!registering) return { error: "Invalid email or password." };
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      fieldErrors[field] ??= field === "email" ? "Enter a valid email address." : issue.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors };
  }
  let destination = "/dashboard";
  try {
    const auth = getAuth();
    if (registering) {
      const registration = registerSchema.parse(values);
      await auth.api.signUpEmail({ headers: await headers(), body: { name: registration.name, email: registration.email, password: registration.password } });
      destination = "/login";
    } else {
    const session = await auth.api.signInEmail({ headers: await headers(), body: { ...parsed.data, rememberMe: data.get("remember") === "on" } });
    const user = await getPrisma().user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    destination = safeCallback(data.get("callbackUrl"), user?.role === "ADMIN" ? "/admin" : "/dashboard");
    if (user?.role !== "ADMIN" && /^\/admin(?:\/|$)/.test(destination)) destination = "/dashboard";
    }
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status === "TOO_MANY_REQUESTS") return { error: "Too many attempts. Please wait a few minutes and try again." };
      if (registering && ["USER_ALREADY_EXISTS", "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"].includes(error.body?.code ?? "")) {
        return { error: "This email is already registered. Please log in or use another email.", fieldErrors: { email: "This email is already registered." } };
      }
    }
    return { error: registering ? "Unable to create this account. Check your details or try logging in." : "Unable to log in. Check your email/password and try again." };
  }
  redirect(destination);
}
export async function logout() {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/");
}
export async function studentLogout(): Promise<ActionState> {
  try {
    await getAuth().api.signOut({ headers: await headers() });
    revalidatePath("/", "layout");
    return { success: "You've been logged out successfully." };
  } catch { return { error: "Unable to log out. Please try again." }; }
}
