import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/current-user";
import { youtubeAccountCookie } from "@/lib/oauth";
import { syncYouTube, storedChannel, YouTubeError } from "@/services/youtube";
export async function GET() {
  const user = await requireUser("/profile"), jar = await cookies();
  let destination = "/profile?youtube=connected";
  try {
    const accountId = jar.get(youtubeAccountCookie)?.value;
    // A reloaded successful callback is harmless and never repeats provider I/O.
    const result = !accountId && await storedChannel(user.id) ? { choose: false } : await syncYouTube(user.id, accountId);
    if (result.choose) destination = "/profile/youtube/choose";
    else { jar.delete({ name: youtubeAccountCookie, path: "/profile/youtube" }); revalidatePath("/profile"); }
  } catch (error) { destination = `/profile?youtube=${error instanceof YouTubeError && error.code === "no-channel" ? "no-channel" : "error"}`; }
  redirect(destination);
}
