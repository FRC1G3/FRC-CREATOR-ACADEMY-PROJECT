import "@/styles/dashboard/recent-achievements.css";
import { Shield, Play, Target } from "lucide-react";
import { recentAchievements, lastQuiz } from "@/data/dashboard-data";

export default function RecentAchievements() {
  return (
    <section className="recent-achievements app-card">
      <div className="achievements-top">
        <h2>Recent Achievements</h2>
        <span aria-disabled="true">View All</span>
      </div>
      <div className="achievements-body">
        {recentAchievements.map((achievement) => (
          <article className="achievement" key={achievement.kind}>
            <div className={`achievement-icon ${achievement.kind}`} aria-hidden="true">
              <span className="achievement-frame" />
              {achievement.kind === "creator" ? <><Shield size={48} /><Play className="achievement-play" size={20} fill="currentColor" /></> : <Target size={48} />}
            </div>
            <div className="achievement-text">
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              <span>{achievement.date}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="achievements-quiz">
        <span>Last Quiz <small>· Demo result</small></span>
        <span>{lastQuiz.title}</span>
        <strong>{lastQuiz.score}% — {lastQuiz.result}</strong>
      </div>
    </section>
  );
}
