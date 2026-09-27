import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import ProfileHero from "@/components/profile/ProfileHero";
import LearningProgress from "@/components/profile/LearningProgress";
import YouTubeConnection from "@/components/profile/YouTubeConnection";
import RecentActivity from "@/components/profile/RecentActivity";
import AchievementBadge from "@/components/achievements/AchievementBadge";
import { requireUser } from "@/lib/current-user";
import { studentOverview } from "@/services/learning";
import { badgeViews, dateLabel } from "@/services/presentation";
import { getPrisma } from "@/lib/prisma";
import type { ProfileView, ActivityView } from "@/types/learning";
import "@/styles/achievements/achievements.css";
import "@/styles/profile/profile.css";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [overview, channel] = await Promise.all([studentOverview(user.id), getPrisma().youTubeConnection.findUnique({ where: { userId: user.id }, select: { channelTitle: true, subscriberCount: true, videoCount: true, viewCount: true } })]);
  const achievementBadges = badgeViews(overview.badges);
  const profile: ProfileView = { name: user.name, email: user.email, role: user.role === "ADMIN" ? "Administrator" : "Creator Member", joined: dateLabel(user.createdAt), avatar: user.avatarUrl ?? "/images/profiles/frc.PNG", bio: user.bio ?? "", progress: overview.percentage, completed: overview.completed, total: overview.total, quizAverage: overview.attempts.length ? Math.round(overview.attempts.reduce((n,a) => n+(a.score ?? 0),0)/overview.attempts.length) : 0, streak: overview.streak.days, badges: achievementBadges.filter(b => b.status === "earned").length, connected: Boolean(channel), channel: channel?.channelTitle ?? "Not Connected", subscribers: channel?.subscriberCount?.toString() ?? "0", videos: channel?.videoCount?.toString() ?? "0", views: channel?.viewCount?.toString() ?? "0" };
  const activity: ActivityView[] = overview.progress.filter(p => p.completedAt).sort((a,b) => b.completedAt!.getTime()-a.completedAt!.getTime()).slice(0,5).map(p => ({ title: "Completed lesson", detail: p.lesson.title, time: dateLabel(p.completedAt!), kind: "completed" }));
  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-heading"><span>CREATOR PROFILE</span><h1>Your Profile</h1><p>Manage your account, track your learning progress, and connect your creator identity.</p></header>
        <ProfileHero profile={profile} />
        <div className="profile-grid">
          <div className="profile-main">
            <LearningProgress profile={profile} />
            <section className="profile-badges app-card">
              <div className="profile-section-heading"><Trophy /><div><h2>Earned Badges</h2><p>Badges you&apos;ve unlocked on your creator journey.</p></div><Link href="/achievements">View All Achievements <ArrowRight /></Link></div>
              <div className="profile-badge-grid">{achievementBadges.filter((badge) => badge.status === "earned").map((badge) => <AchievementBadge key={badge.title} badge={badge} />)}</div>
            </section>
            <YouTubeConnection profile={profile} />
          </div>
          <RecentActivity profileActivity={activity} />
        </div>
      </div>
    </main>
  );
}
