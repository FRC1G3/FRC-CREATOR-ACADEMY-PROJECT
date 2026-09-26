import Image from "next/image";
import { CalendarDays, Share2, Zap, SquarePlay, Trophy, Camera } from "lucide-react";
import type { ProfileView } from "@/types/learning";
import ProfileEdit from "./ProfileEdit";

export default function ProfileHero({ profile }: { profile: ProfileView }) {
  return (
    <section className="profile-hero app-card">
      <div className="profile-avatar"><Image unoptimized src={profile.avatar} alt="Creator avatar placeholder" width={140} height={140} /><button type="button" disabled aria-label="Change profile photo"><Camera size={16} /></button></div>
      <div className="profile-identity"><h2>{profile.name}</h2><span>{profile.role}</span><small><CalendarDays size={13} />Joined {profile.joined}</small><p>{profile.email}</p><p>{profile.bio}</p><div className="profile-hero-actions"><ProfileEdit name={profile.name} bio={profile.bio} avatar={profile.avatar} /><button type="button" disabled><Share2 />Share Profile</button></div></div>
      <div className="profile-status-pills"><span><Zap />Active Learner</span><span><SquarePlay />{profile.connected ? "YouTube Connected" : "YouTube Not Connected"}</span><span><Trophy />{profile.badges} Badges Earned</span></div>
    </section>
  );
}
