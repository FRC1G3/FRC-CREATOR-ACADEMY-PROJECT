import { requireUser } from "@/lib/current-user";
import { studentOverview } from "@/services/learning";
import { badgeViews } from "@/services/presentation";
import { percentage } from "@/lib/learning-rules";
import AchievementSummary from "@/components/achievements/AchievementSummary";
import AchievementSection from "@/components/achievements/AchievementSection";
import "@/styles/achievements/achievements.css";

export default async function AchievementsPage() {
  const user = await requireUser("/achievements");
  const badges = badgeViews((await studentOverview(user.id)).badges);
  const earned = badges.filter(b => b.status === "earned").length;
  return (
    <main className="achievements-page">
      <div className="achievements-container">
        <header className="achievements-heading">
          <span>CREATOR PROGRESS</span>
          <h1>Achievements</h1>
          <p>Track your milestones, unlock badges, and celebrate your progress.</p>
        </header>
        <AchievementSummary achievementSummary={{ earned, total: badges.length, progress: percentage(earned, badges.length), next: badges.find(b => b.status === "locked")?.description ?? "All available badges earned" }} />
        <AchievementSection status="earned" achievementBadges={badges} />
        <AchievementSection status="locked" achievementBadges={badges} />
      </div>
    </main>
  );
}
