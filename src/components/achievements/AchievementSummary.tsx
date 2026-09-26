import { Trophy, ChartNoAxesColumnIncreasing, Flag, ChevronRight } from "lucide-react";
import { achievementSummary } from "@/data/achievements-data";

export default function AchievementSummary() {
  return (
    <section className="achievements-summary" aria-label="Achievement summary">
      <div className="achievements-summary-card app-card earned">
        <span className="achievements-summary-icon"><Trophy aria-hidden="true" /></span>
        <div><h2>Badges Earned</h2><strong>{achievementSummary.earned} / <span>{achievementSummary.total}</span></strong></div>
      </div>
      <div className="achievements-summary-card app-card">
        <span className="achievements-summary-icon"><ChartNoAxesColumnIncreasing aria-hidden="true" /></span>
        <div><h2>Achievement Progress</h2><b>{achievementSummary.progress}%</b><div className="achievements-progress"><progress value={achievementSummary.progress} max={100} aria-label="Achievement progress" /><span>{achievementSummary.earned} / {achievementSummary.total}</span></div></div>
      </div>
      <div className="achievements-summary-card app-card">
        <span className="achievements-summary-icon"><Flag aria-hidden="true" /></span>
        <div><h2>Next Milestone</h2><h3>{achievementSummary.next}</h3></div><ChevronRight className="achievements-summary-chevron" aria-hidden="true" />
      </div>
    </section>
  );
}
