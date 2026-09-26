import { Trophy, LockKeyhole } from "lucide-react";
import AchievementBadge from "./AchievementBadge";
import type { BadgeView } from "@/types/learning";

export default function AchievementSection({ status, achievementBadges }: { status: "earned" | "locked"; achievementBadges: BadgeView[] }) {
  const earned = status === "earned";
  return (
    <section className={`achievements-section app-card ${status}`} aria-labelledby={`achievements-${status}-title`}>
      <div className="achievements-section-heading">
        {earned ? <Trophy aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
        <div><h2 id={`achievements-${status}-title`}>{earned ? "Earned Badges" : "Locked Badges"}</h2><p>{earned ? "Badges you've unlocked on your creator journey." : "Keep learning to unlock these badges."}</p></div>
      </div>
      {!achievementBadges.some(b => b.status === status) && <p>{earned ? "Complete learning milestones to earn your first badge." : "No locked badges."}</p>}
      <div className="achievements-badge-grid">{achievementBadges.filter((badge) => badge.status === status).map((badge) => <AchievementBadge key={badge.title} badge={badge} />)}</div>
    </section>
  );
}
