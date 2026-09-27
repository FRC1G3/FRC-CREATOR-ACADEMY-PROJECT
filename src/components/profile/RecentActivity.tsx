import { Clock3, ArrowRight, CircleCheck, Target, FileText, Trophy } from "lucide-react";
import type { ActivityView } from "@/types/learning";

const activityIcons = { completed: CircleCheck, quiz: Target, started: FileText, badge: Trophy };
export default function RecentActivity({ profileActivity }: { profileActivity: ActivityView[] }) {
  return (
    <aside className="profile-activity app-card" aria-labelledby="profile-activity-title">
      <div className="profile-section-heading"><Clock3 /><h2 id="profile-activity-title">Recent Activity</h2><button type="button" disabled title="Unavailable in this university demo">View All <ArrowRight /></button></div>
      {profileActivity.length === 0 && <p>No learning activity yet.</p>}<ol>{profileActivity.map((activity) => { const Icon = activityIcons[activity.kind]; return (
        <li key={`${activity.kind}-${activity.detail}-${activity.time}`}><span className={`profile-activity-icon ${activity.kind}`}><Icon aria-hidden="true" /></span><div><h3>{activity.title}</h3><p>{activity.detail}</p></div><span className="profile-activity-time">{activity.time}</span></li>
      ); })}</ol>
    </aside>
  );
}
