"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { SquarePlay, CircleCheck, RefreshCw, Users, TvMinimalPlay, Eye, ExternalLink } from "lucide-react";
import DatabaseImage from "@/components/learning/DatabaseImage";
import { authClient } from "@/lib/auth-client";
import { youtubeScope } from "@/lib/oauth";
import { channelCount, channelUrl, type ConnectedChannel } from "@/lib/youtube-channel";
import { refreshYouTube, removeYouTube } from "@/actions/youtube";

export default function YouTubeConnection({ channel, enabled, notice }: { channel: ConnectedChannel | null; enabled: boolean; notice?: string }) {
  const [pending, startTransition] = useTransition();
  const [connecting, setConnecting] = useState(false);
  const [feedback, setFeedback] = useState({ text: notice ?? "", error: Boolean(notice && notice !== "Your YouTube channel is connected."), reconnect: false });
  const busy = useRef(false);
  useEffect(() => {
    const reset = () => { busy.current = false; setConnecting(false); };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  if (!enabled && !channel) return null;
  async function connect() {
    if (busy.current || pending || connecting) return;
    busy.current = true; setConnecting(true); setFeedback({ text: "", error: false, reconnect: false });
    try {
      const result = await authClient.linkSocial({ provider: "google", scopes: [youtubeScope], callbackURL: "/profile/youtube/complete", errorCallbackURL: "/profile/youtube/error", additionalParams: { access_type: "offline", prompt: "consent select_account", include_granted_scopes: "true" } });
      if (result.error) throw new Error("Authorization unavailable");
    } catch {
      busy.current = false; setConnecting(false);
      setFeedback({ text: "Unable to open Google authorization. Please try again.", error: true, reconnect: false });
    }
  }
  function change(remove: boolean) {
    if (busy.current || pending || connecting) return;
    if (remove && !window.confirm("Remove this channel from Creator Academy? Your Google login and Google permissions will remain unchanged.")) return;
    busy.current = true;
    startTransition(async () => {
      try {
        const result = await (remove ? removeYouTube() : refreshYouTube());
        setFeedback({ text: "error" in result ? result.error ?? "Unable to update channel." : result.success, error: "error" in result, reconnect: "reconnect" in result && result.reconnect });
      } catch (error) { unstable_rethrow(error); setFeedback({ text: "Unable to update the channel. Please try again.", error: true, reconnect: false }); }
      finally { busy.current = false; }
    });
  }
  return (
    <section className="profile-youtube app-card">
      <div className="profile-section-heading"><SquarePlay /><div><h2>YouTube Channel</h2><p>Optionally connect your channel to show its identity and basic statistics.</p></div></div>
      {channel ? <div className="profile-channel app-card">
        <div className="profile-channel-identity"><DatabaseImage src={channel.thumbnailUrl} fallback="/images/frc-academy-logo.png" alt={`${channel.channelTitle} channel photo`} width={54} height={54} /><div><h3>{channel.channelTitle}</h3>{channel.customUrl && <small>{channel.customUrl}</small>}<span><CircleCheck />{feedback.reconnect ? "Reconnect required" : "Connected to YouTube"}</span><small>Connected {new Date(channel.connectedAt).toLocaleDateString("en-US", { timeZone: "UTC" })}</small><small><RefreshCw />{channel.lastSyncedAt ? `Last synced ${new Date(channel.lastSyncedAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC` : "Not synced yet"}</small></div></div>
        <div className="profile-channel-stat"><Users /><p><strong>{channel.hiddenSubscriberCount ? "Hidden" : channelCount(channel.subscriberCount)}</strong><span>Subscribers</span></p></div>
        <div className="profile-channel-stat"><TvMinimalPlay /><p><strong>{channelCount(channel.videoCount)}</strong><span>Videos</span></p></div>
        <div className="profile-channel-stat"><Eye /><p><strong>{channelCount(channel.viewCount)}</strong><span>Views</span></p></div>
      </div> : <p>Not Connected</p>}
      <div className="profile-youtube-actions">
        {enabled && (!channel || feedback.reconnect) && <button className="profile-primary" type="button" onClick={connect} disabled={pending || connecting}>{connecting ? "Connecting..." : "Connect YouTube"}</button>}
        {enabled && channel && !feedback.reconnect && <button type="button" onClick={() => change(false)} disabled={pending || connecting}><RefreshCw />{pending ? "Updating..." : "Refresh Channel"}</button>}
        {channel && <><a href={channelUrl(channel.channelId)} target="_blank" rel="noopener noreferrer">View on YouTube <ExternalLink /></a><button type="button" onClick={() => change(true)} disabled={pending || connecting}>Remove Connection</button></>}
      </div>
      {feedback.text && <p className="profile-youtube-feedback" role={feedback.error ? "alert" : "status"}>{feedback.text}</p>}
    </section>
  );
}
