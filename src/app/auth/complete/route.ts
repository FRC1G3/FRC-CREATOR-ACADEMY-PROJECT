import { requireUser } from "@/lib/current-user";
import { socialDestination } from "@/lib/oauth";
import { redirect } from "next/navigation";
export async function GET(request: Request) {
  const user = await requireUser();
  redirect(user.role === "ADMIN" ? "/admin" : socialDestination(new URL(request.url).searchParams.get("next")));
}
