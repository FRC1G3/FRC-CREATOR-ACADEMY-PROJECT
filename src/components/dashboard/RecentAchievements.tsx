import "@/styles/dashboard/recent-achievements.css";
import { Shield, Play, Target } from "lucide-react";
import Link from "next/link";

export default function RecentAchievements({ recentAchievements, lastQuiz }: { recentAchievements: { title: string; description: string; date: string; kind: string }[]; lastQuiz: { title: string; score: number; result: string; href: string } | null }) {
  return (
    <section className="recent-achievements app-card">
      <div className="achievements-top">
        <h2>Recent Achievements</h2>
        <Link href="/achievements">View All</Link>
      </div>
      {recentAchievements.length === 0 && <p>No achievements yet. Keep learning!</p>}
      <div className="achievements-body">
        {recentAchievements.map((achievement) => (
          <article className="achievement" key={achievement.title}>
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
        <span>Last Quiz</span>
        {lastQuiz ? <><Link href={lastQuiz.href}>{lastQuiz.title}</Link><strong>{lastQuiz.score}% — {lastQuiz.result}</strong></> : <span>No completed quiz yet.</span>}
      </div>
    </section>
  );
}
