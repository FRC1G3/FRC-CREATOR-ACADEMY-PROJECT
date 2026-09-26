import Image from "next/image";
import { SquarePlay, Settings, CircleCheck, RefreshCw, Users, TvMinimalPlay, Eye } from "lucide-react";
import { profilePreview as profile } from "@/data/profile-data";

export default function YouTubeConnection() {
  return (
    <section className="profile-youtube app-card">
      <div className="profile-section-heading"><SquarePlay /><div><h2>YouTube Connection</h2><p>Connect your YouTube channel to track your growth and unlock personalized content.</p></div><button type="button" disabled><Settings />Manage Connection</button></div>
      <div className="profile-channel app-card">
        <div className="profile-channel-identity"><Image src="/images/profiles/frc.PNG" alt="F.R.C channel logo" width={54} height={54} /><div><h3>{profile.channel}</h3><span><CircleCheck />Connected to YouTube</span><small><RefreshCw />Last synced 2 hours ago</small></div></div>
        <div className="profile-channel-stat"><Users /><p><strong>{profile.subscribers}</strong><span>Subscribers</span></p></div>
        <div className="profile-channel-stat"><TvMinimalPlay /><p><strong>{profile.videos}</strong><span>Videos</span></p></div>
        <div className="profile-channel-stat"><Eye /><p><strong>{profile.views}</strong><span>Views</span></p></div>
      </div>
    </section>
  );
}
