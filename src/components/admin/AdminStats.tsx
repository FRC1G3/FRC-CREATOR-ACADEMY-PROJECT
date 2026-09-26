import { ArrowUp } from "lucide-react";
import { adminStats } from "@/data/admin-data";

export default function AdminStats() {
  return (
    <section className="admin-stats" aria-label="Academy summary">
      {adminStats.map(({ label, value, trend, icon: Icon, tone }) => (
        <article className="app-card admin-stat" key={label}>
          <span className={`admin-icon admin-tone-${tone}`}><Icon size={28} aria-hidden="true" /></span>
          <div><h2>{label}</h2><strong>{value}</strong><p><ArrowUp size={14} aria-hidden="true" />{trend}</p></div>
        </article>
      ))}
    </section>
  );
}
