import DashboardHero from "@/components/dashboard/DashboardHero";
import ContinueLearning from "@/components/dashboard/ContinueLearning"
import OverallProgress from "@/components/dashboard/OverallProgress";
import StreakCard from "@/components/dashboard/StreakCard";
import NextLesson from "@/components/dashboard/NextLesson";
import RoadmapProgress from "@/components/dashboard/RoadmapProgress";
import RecentAchievements from "@/components/dashboard/RecentAchievements";
import DashboardPromo from "@/components/dashboard/DashboardPromo";
import "@/styles/dashboard/dashboard.css";
export default function DashboardPage() {
  return (
    <main className="dashboard">
      <DashboardHero />
      <section className="dashboard-sec2" aria-label="Learning overview">
        <ContinueLearning/>
        <OverallProgress />
        <StreakCard />
      </section>
      <section className="dashboard-sec3" aria-label="Next steps">
        <NextLesson />
        <RoadmapProgress />
      </section>
      <section className="dashboard-sec4" aria-label="Achievements and inspiration">
        <RecentAchievements />
        <DashboardPromo />
      </section>
    </main>
  );
}
