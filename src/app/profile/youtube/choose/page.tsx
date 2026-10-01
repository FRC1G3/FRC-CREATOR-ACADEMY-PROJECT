import { cookies } from "next/headers";
import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { youtubeAccountCookie } from "@/lib/oauth";
import { ownChannels, youtubeFailure } from "@/services/youtube";
import YouTubeChannelChoices from "@/components/profile/YouTubeChannelChoices";
import type { YouTubeChannelData } from "@/lib/youtube-channel";
import "@/styles/profile/profile.css";

export default async function ChooseYouTubePage() {
  const user = await requireUser("/profile");
  let channels: YouTubeChannelData[] = [], errorMessage = "";
  try {
    const accountId = (await cookies()).get(youtubeAccountCookie)?.value;
    channels = await ownChannels(user.id, accountId);
  } catch (error) { errorMessage = youtubeFailure(error).error; }
  return <main className="profile-page"><div className="profile-container"><section className="profile-youtube app-card"><h1>Choose your YouTube channel</h1><p>This Google account returned more than one channel. Select the channel to display in your Profile.</p>{errorMessage ? <p role="alert">{errorMessage}</p> : <YouTubeChannelChoices channels={channels} />}<Link href="/profile">Back to Profile</Link></section></div></main>;
}
