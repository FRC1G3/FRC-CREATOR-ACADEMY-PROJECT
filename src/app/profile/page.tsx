import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import ProfileHero from "@/components/profile/ProfileHero";
import LearningProgress from "@/components/profile/LearningProgress";
import YouTubeConnection from "@/components/profile/YouTubeConnection";
import RecentActivity from "@/components/profile/RecentActivity";
import AchievementBadge from "@/components/achievements/AchievementBadge";
import { achievementBadges } from "@/data/achievements-data";
import "@/styles/achievements/achievements.css";
import "@/styles/profile/profile.css";

export default function ProfilePage() {
  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-heading"><span>CREATOR PROFILE</span><h1>Your Profile</h1><p>Manage your account, track your learning progress, and connect your creator identity.</p></header>
        <ProfileHero />
        <div className="profile-grid">
          <div className="profile-main">
            <LearningProgress />
            <section className="profile-badges app-card">
              <div className="profile-section-heading"><Trophy /><div><h2>Earned Badges</h2><p>Badges you&apos;ve unlocked on your creator journey.</p></div><Link href="/achievements">View All Achievements <ArrowRight /></Link></div>
              <div className="profile-badge-grid">{achievementBadges.filter((badge) => badge.status === "earned").map((badge) => <AchievementBadge key={badge.title} badge={badge} />)}</div>
            </section>
            <YouTubeConnection />
          </div>
          <RecentActivity />
        </div>
      </div>
    </main>
  );
}
