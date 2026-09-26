"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { loginSchema, registerSchema, safeCallback, type ActionState } from "@/lib/validation";

export async function authenticate(_: ActionState, data: FormData): Promise<ActionState> {
  const registering = data.get("mode") === "register";
  const values = { email: data.get("email"), password: data.get("password"), name: data.get("full-name"), confirmPassword: data.get("confirm-password") };
  const parsed = registering ? registerSchema.safeParse(values) : loginSchema.safeParse(values);
  if (!parsed.success) return { error: registering ? "Enter a valid name/email, a password of 10–72 characters and matching confirmation." : "Invalid email or password." };
  let destination = "/dashboard";
  try {
    const auth = getAuth();
    if (registering) {
      const registration = registerSchema.parse(values);
      await auth.api.signUpEmail({ headers: await headers(), body: { name: registration.name, email: registration.email, password: registration.password } });
      return { success: "Account created. You can now log in." };
    }
    const session = await auth.api.signInEmail({ headers: await headers(), body: { ...parsed.data, rememberMe: data.get("remember") === "on" } });
    const user = await getPrisma().user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    destination = safeCallback(data.get("callbackUrl"), user?.role === "ADMIN" ? "/admin" : "/dashboard");
    if (user?.role !== "ADMIN" && /^\/admin(?:\/|$)/.test(destination)) destination = "/dashboard";
  } catch {
    return { error: registering ? "Unable to create this account. Check your details or try logging in." : "Unable to log in. Check your email/password and try again." };
  }
  redirect(destination);
}
export async function logout() {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/");
}
