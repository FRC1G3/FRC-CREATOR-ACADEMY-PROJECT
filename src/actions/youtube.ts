"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/current-user";
import { youtubeAccountCookie } from "@/lib/oauth";
import { syncYouTube, refreshChannel, removeChannel, youtubeFailure } from "@/services/youtube";

export async function refreshYouTube() {
  const user = await requireUser("/profile");
  try { await refreshChannel(user.id); revalidatePath("/profile"); return { success: "Channel information refreshed." }; }
  catch (error) { revalidatePath("/profile"); return youtubeFailure(error); }
}
export async function removeYouTube() {
  const user = await requireUser("/profile");
  try { await removeChannel(user.id); revalidatePath("/profile"); return { success: "Channel removed from Creator Academy. Your Google login and permissions are unchanged." }; }
  catch { return { error: "Unable to remove the channel. Please try again." }; }
}
export async function chooseYouTube(channelId: string) {
  const user = await requireUser("/profile");
  if (!/^UC[\w-]{22}$/.test(channelId)) return { error: "Choose a valid channel." };
  try {
    const jar = await cookies();
    await syncYouTube(user.id, jar.get(youtubeAccountCookie)?.value, channelId);
    jar.delete({ name: youtubeAccountCookie, path: "/profile/youtube" });
    revalidatePath("/profile"); return { url: "/profile?youtube=connected" };
  } catch (error) { return youtubeFailure(error); }
}
