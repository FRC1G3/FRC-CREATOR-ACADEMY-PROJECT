import { timed } from "@/lib/performance";
import { requireUser } from "@/lib/current-user";
import { studentBadges } from "@/services/learning";
import { badgeViews } from "@/services/presentation";
import { percentage } from "@/lib/learning-rules";
import AchievementSummary from "@/components/achievements/AchievementSummary";
import AchievementSection from "@/components/achievements/AchievementSection";
import "@/styles/achievements/achievements.css";

async function AchievementsPage() {
  const user = await requireUser("/achievements");
  const badges = badgeViews(await studentBadges(user.id));
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

export default async function ProfiledPage(...args: Parameters<typeof AchievementsPage>) {
  return timed("route.achievements", () => AchievementsPage(...args));
}
