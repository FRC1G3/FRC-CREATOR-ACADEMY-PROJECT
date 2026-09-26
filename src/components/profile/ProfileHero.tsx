import Image from "next/image";
import { CalendarDays, Pencil, Share2, Zap, SquarePlay, Trophy, Camera } from "lucide-react";
import { profilePreview as profile } from "@/data/profile-data";

export default function ProfileHero() {
  return (
    <section className="profile-hero app-card">
      <div className="profile-avatar"><Image src={profile.avatar} alt="Creator avatar placeholder" width={140} height={140} /><button type="button" disabled aria-label="Change profile photo"><Camera size={16} /></button></div>
      <div className="profile-identity"><h2>{profile.name}</h2><span>{profile.role}</span><small><CalendarDays size={13} />Joined {profile.joined}</small><p>{profile.bio}</p><div className="profile-hero-actions"><button type="button" disabled className="profile-primary"><Pencil />Edit Profile</button><button type="button" disabled><Share2 />Share Profile</button></div></div>
      <div className="profile-status-pills"><span><Zap />Active Learner</span><span><SquarePlay />YouTube Connected</span><span><Trophy />{profile.badges} Badges Earned</span></div>
    </section>
  );
}
