"use client";
import { useState } from "react";
import DatabaseImage from "@/components/learning/DatabaseImage";
import { CalendarDays, Share2, Zap, SquarePlay, Trophy, Camera } from "lucide-react";
import type { ProfileView } from "@/types/learning";
import ProfileEdit from "./ProfileEdit";

export default function ProfileHero({ profile }: { profile: ProfileView }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="profile-hero app-card">
      <div className="profile-avatar"><DatabaseImage src={profile.avatar} fallback="/images/profiles/frc.PNG" alt="" width={140} height={140} /><button type="button" onClick={() => setOpen(true)} aria-label="Change profile photo" aria-expanded={open} aria-controls="profile-edit-form"><Camera size={16} /></button></div>
      <div className="profile-identity"><h2>{profile.name}</h2><span>{profile.role}</span><small><CalendarDays size={13} />Joined {profile.joined}</small><p>{profile.email}</p><p>{profile.bio}</p><div className="profile-hero-actions"><ProfileEdit open={open} setOpen={setOpen} name={profile.name} bio={profile.bio} avatar={profile.avatar} /><button type="button" disabled title="Unavailable in this university demo"><Share2 />Share Profile</button></div></div>
      <div className="profile-status-pills"><span><Zap />Active Learner</span><span><SquarePlay />{profile.connected ? "YouTube Connected" : "YouTube Not Connected"}</span><span><Trophy />{profile.badges} Badges Earned</span></div>
    </section>
  );
}
