import "@/styles/dashboard/dashboard-hero.css";
import { Quote } from 'lucide-react';
export default function DashboardHero({ name }: { name: string }) {
  return (
  
      <section className="dashboard-hero">
      <div className="dashboard-hero-left">
        <p className="dashboard-welcome text-3xl">Welcome back,</p>

        <h1 className="dashboard-user-name text-5xl">
          {name} 👋
        </h1>

        <p className="dashboard-quote">
          “Consistency today, a bigger tomorrow.”
        </p>
      </div>
      <div className="dashboard-hero-right">
        <Quote className="size-12 "  />
        <p className="section-description ">A little progress each day adds up to remarkable achievements.</p>
      </div>
    </section>

  );
}