import { Play, Star, Flame, Clapperboard, ChartNoAxesColumnIncreasing, Crown, CalendarDays, LockKeyhole } from "lucide-react";
import type { BadgeView } from "@/types/learning";

type AchievementBadgeProps = { badge: BadgeView };
const badgeIcons = { play: Play, star: Star, flame: Flame, shorts: Clapperboard, chart: ChartNoAxesColumnIncreasing, crown: Crown };

export default function AchievementBadge({ badge }: AchievementBadgeProps) {
  const Icon = badgeIcons[badge.icon];
  const earned = badge.status === "earned";
  return (
    <article className={`achievements-badge ${badge.status}`}>
      <div className="achievements-badge-emblem" aria-hidden="true">
        <svg className="achievements-badge-hex" viewBox="0 0 100 112"><path d="M50 4 94 29V83L50 108 6 83V29Z" /><path className="achievements-badge-inner" d="M50 13 86 34V78L50 99 14 78V34Z" /></svg>
        <Icon className="achievements-badge-symbol" strokeWidth={1.7} />
      </div>
      <div className="achievements-badge-info">
        <h3>{badge.title}</h3><p>{badge.description}</p>
        <div className="achievements-badge-footer">
          {earned ? <span className="achievements-badge-date"><CalendarDays size={14} aria-hidden="true" />Earned {badge.earnedDate}</span> : <LockKeyhole size={15} aria-hidden="true" />}
          <span className="achievements-badge-status">{earned ? "Earned" : "Locked"}</span>
        </div>
      </div>
    </article>
  );
}
