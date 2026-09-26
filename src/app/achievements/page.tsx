import AchievementSummary from "@/components/achievements/AchievementSummary";
import AchievementSection from "@/components/achievements/AchievementSection";
import "@/styles/achievements/achievements.css";

export default function AchievementsPage() {
  return (
    <main className="achievements-page">
      <div className="achievements-container">
        <header className="achievements-heading">
          <span>CREATOR PROGRESS</span>
          <h1>Achievements</h1>
          <p>Track your milestones, unlock badges, and celebrate your progress.</p>
        </header>
        <AchievementSummary />
        <AchievementSection status="earned" />
        <AchievementSection status="locked" />
      </div>
    </main>
  );
}
