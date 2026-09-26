import { adminActions } from "@/data/admin-data";
import Link from "next/link";

export default function QuickActions() {
  return (
    <section className="app-card admin-panel">
      <div className="admin-panel-heading"><div><h2>Quick Actions</h2><p>Create new content and manage your academy.</p></div></div>
      <div className="admin-actions">
        {adminActions.map(({ title, description, icon: Icon, tone, href }) => (
          <Link href={href} className={`admin-action admin-tone-${tone}`} key={title}>
            <span className="admin-icon"><Icon size={22} aria-hidden="true" /></span><span><strong>{title}</strong><small>{description}</small></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
