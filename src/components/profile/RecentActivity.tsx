import { Clock3, ArrowRight, CircleCheck, Target, FileText, Trophy } from "lucide-react";
import { profileActivity } from "@/data/profile-data";

const activityIcons = { completed: CircleCheck, quiz: Target, started: FileText, badge: Trophy };
export default function RecentActivity() {
  return (
    <aside className="profile-activity app-card" aria-labelledby="profile-activity-title">
      <div className="profile-section-heading"><Clock3 /><h2 id="profile-activity-title">Recent Activity</h2><button type="button" disabled>View All <ArrowRight /></button></div>
      <ol>{profileActivity.map((activity) => { const Icon = activityIcons[activity.kind]; return (
        <li key={activity.detail}><span className={`profile-activity-icon ${activity.kind}`}><Icon aria-hidden="true" /></span><div><h3>{activity.title}</h3><p>{activity.detail}</p></div><span className="profile-activity-time">{activity.time}</span></li>
      ); })}</ol>
    </aside>
  );
}
