import { Trophy, LockKeyhole } from "lucide-react";
import AchievementBadge from "./AchievementBadge";
import { achievementBadges } from "@/data/achievements-data";

export default function AchievementSection({ status }: { status: "earned" | "locked" }) {
  const earned = status === "earned";
  return (
    <section className={`achievements-section app-card ${status}`} aria-labelledby={`achievements-${status}-title`}>
      <div className="achievements-section-heading">
        {earned ? <Trophy aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
        <div><h2 id={`achievements-${status}-title`}>{earned ? "Earned Badges" : "Locked Badges"}</h2><p>{earned ? "Badges you've unlocked on your creator journey." : "Keep learning to unlock these badges."}</p></div>
      </div>
      <div className="achievements-badge-grid">{achievementBadges.filter((badge) => badge.status === status).map((badge) => <AchievementBadge key={badge.title} badge={badge} />)}</div>
    </section>
  );
}
