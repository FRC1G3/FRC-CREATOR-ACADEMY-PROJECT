import "server-only";
import { timed } from "./performance";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";
import { safeCallback } from "./validation";

export const getCurrentUser = cache(() => timed("auth.resolve", async () => {
  const requestHeaders = await headers();
  if (!requestHeaders.get("cookie")?.includes("better-auth.session_token")) return null;
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) return null;
  const session = await getAuth().api.getSession({ headers: requestHeaders, query: { disableCookieCache: true } });
  if (!session) return null;
  // Cookie caching and secondary session storage are NOT enabled. Better Auth
  // resolves the session and current user together from PostgreSQL on each request.
  const user = session.user;
  return { id: user.id, name: user.name, email: user.email, bio: user.bio ?? null,
    avatarUrl: user.image ?? null, role: user.role, createdAt: user.createdAt };
}));
export async function requireUser(callback = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(safeCallback(callback))}`);
  return user;
}
export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
