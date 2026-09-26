import "@/styles/dashboard/roadmap-progress.css";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, BookOpen } from "lucide-react";
import { roadmapStages } from "@/data/dashboard-data";

export default function RoadmapProgress() {
  return (
    <section className="roadmap-progress app-card">
      <div className="roadmap-progress-top">
        <h2>Roadmap Progress</h2>
        <Link href="/roadmap">View Roadmap <ArrowRight size={16} /></Link>
      </div>
      <ol className="roadmap-stages">
        {roadmapStages.map((stage) => (
          <li key={stage.title} className={stage.status} aria-current={stage.status === "current" ? "step" : undefined}>
            <span className="roadmap-stage-icon" aria-label={stage.status}>
              {stage.status === "completed" ? <Check size={18} strokeWidth={3} /> : stage.status === "current" ? <BookOpen size={16} /> : <LockKeyhole size={16} />}
            </span>
            <span className="roadmap-stage-title">{stage.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
