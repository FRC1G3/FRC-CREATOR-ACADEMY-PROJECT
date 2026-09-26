import { ArrowRight } from "lucide-react";
import { adminActivity } from "@/data/admin-data";

export default function RecentActivity() {
  return (
    <section className="app-card admin-panel">
      <div className="admin-panel-heading"><h2>Recent Activity</h2><button type="button" className="admin-text-button" aria-disabled="true">View All<ArrowRight size={14} /></button></div>
      <ol className="admin-activity">
        {adminActivity.map(({ title, detail, time, icon: Icon, tone }) => (
          <li key={title}><span className={`admin-icon admin-tone-${tone}`}><Icon size={18} aria-hidden="true" /></span><div><strong>{title}</strong><p>{detail}</p></div><span className="admin-activity-time">{time}</span></li>
        ))}
      </ol>
    </section>
  );
}
