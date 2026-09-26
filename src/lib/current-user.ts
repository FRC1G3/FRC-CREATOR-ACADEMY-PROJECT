import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";
import { getPrisma } from "./prisma";
import { safeCallback } from "./validation";

export const getCurrentUser = cache(async () => {
  const requestHeaders = await headers();
  if (!requestHeaders.get("cookie")?.includes("better-auth.session_token")) return null;
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) return null;
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;
  return getPrisma().user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, bio: true, avatarUrl: true, role: true, createdAt: true } });
});
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
