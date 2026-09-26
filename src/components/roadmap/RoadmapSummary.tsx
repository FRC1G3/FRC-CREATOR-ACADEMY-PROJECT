import { ListChecks, Trophy, Target } from "lucide-react";
import type { SummaryView } from "@/types/learning";

export default function RoadmapSummary({ roadmapSummary }: { roadmapSummary: SummaryView }) {
  return (
    <section className="roadmap-summary" aria-label="Course progress summary">
      <div className="roadmap-summary-card app-card">
        <div className="roadmap-summary-ring" role="img" aria-label={`${roadmapSummary.percentage}% complete`}>
          <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="24" /><circle className="roadmap-summary-fill" cx="30" cy="30" r="24" pathLength="100" strokeDasharray={`${roadmapSummary.percentage} 100`} /></svg>
        </div>
        <div><strong>{roadmapSummary.percentage}%</strong><h2>Course Completion</h2><p>{roadmapSummary.lessons}</p></div>
      </div>
      <div className="roadmap-summary-card app-card"><ListChecks aria-hidden="true" /><div><strong>{roadmapSummary.modules}</strong><h2>Modules Completed</h2></div></div>
      <div className="roadmap-summary-card app-card"><Trophy className="roadmap-summary-trophy" aria-hidden="true" /><div><strong>{roadmapSummary.quizzes}</strong><h2>Quizzes Passed</h2></div></div>
      <div className="roadmap-summary-card app-card"><Target aria-hidden="true" /><div><h2>Current Module</h2><strong className="roadmap-summary-current">{roadmapSummary.current}</strong><p>{roadmapSummary.current === "Complete" ? "Completed" : "Next step"}</p></div></div>
    </section>
  );
}
