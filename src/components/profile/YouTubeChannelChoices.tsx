"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import DatabaseImage from "@/components/learning/DatabaseImage";
import { chooseYouTube } from "@/actions/youtube";
import type { YouTubeChannelData } from "@/lib/youtube-channel";

export default function YouTubeChannelChoices({ channels }: { channels: YouTubeChannelData[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const busy = useRef(false);
  function choose(channelId: string) {
    if (busy.current || pending) return;
    busy.current = true; setError("");
    startTransition(async () => {
      try {
        const result = await chooseYouTube(channelId);
        if ("url" in result && result.url) router.replace(result.url); else setError(result.error ?? "Unable to connect channel.");
      } catch (error) { unstable_rethrow(error); setError("Unable to connect this channel. Please try again."); }
      finally { busy.current = false; }
    });
  }
  return <><div className="profile-youtube-actions">{channels.map(channel => <button key={channel.channelId} type="button" disabled={pending} onClick={() => choose(channel.channelId)}><DatabaseImage src={channel.thumbnailUrl} fallback="/images/frc-academy-logo.png" alt="" width={40} height={40} />{channel.channelTitle}</button>)}</div>{error && <p role="alert">{error}</p>}</>;
}
