import type { ProgressView } from "@/types/learning";
import "@/styles/dashboard/overall-progress.css";

export default function OverallProgress({ overallProgress }: { overallProgress: ProgressView }) {
  return (
    <section className="overall-progress app-card col-3" aria-labelledby="overall-progress-title">
      <h2 id="overall-progress-title">Overall Progress</h2>
      <div className="overall-progress-body">
        <div className="overall-progress-ring" role="img" aria-label={`${overallProgress.percentage}% completed`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="overall-progress-track" cx="60" cy="60" r="50" />
            <circle className="overall-progress-fill" cx="60" cy="60" r="50" pathLength="100" strokeDasharray={`${overallProgress.percentage} 100`} />
          </svg>
          <strong>{overallProgress.percentage}%</strong>
        </div>
        <ul className="overall-progress-legend">
          {overallProgress.summary.map((item) => (
            <li key={item.status}>
              <span className={`overall-progress-dot ${item.status}`} aria-hidden="true" />
              <div><span>{item.label}</span><p>{item.lessons} learning units</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
