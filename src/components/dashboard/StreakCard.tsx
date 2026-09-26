import { Check } from "lucide-react";

import "@/styles/dashboard/streak-card.css";

export default function StreakCard({ learningStreak }: { learningStreak: { days: number; week: { day: string; completed: boolean }[] } }) {
  return (
    <section className="streak-card app-card col-3" aria-labelledby="streak-title">
      <h2 id="streak-title">{learningStreak.days} Day Streak</h2>
      <div className="streak-summary">
        <svg className="streak-flame" viewBox="0 0 64 80" aria-hidden="true">
          <path fill="#ff5225" d="M30 2c17 7 22 20 17 34l8-10c14 26 7 51-22 52C8 79 0 59 8 39l9-17c-2 13 1 17 5 19C29 30 34 17 30 2Z" />
          <path fill="#ffab32" d="M33 28c11 13 8 22 12 26l5-8c7 18-2 30-17 31-17 0-24-14-17-28l7-11c-1 10 2 15 4 16 6-9 7-17 6-26Z" />
          <path fill="#ffec9a" d="M33 49c13 12 16 27 0 28-14 0-17-12 0-28Z" />
        </svg>
        <div><strong>{learningStreak.days} days</strong><p>Keep going!</p></div>
      </div>
      <ul className="streak-week">
        {learningStreak.week.map(({ day, completed }) => (
          <li key={day} aria-label={`${day}: ${completed ? "completed" : "not completed"}`}>
            <span className={`streak-day${completed ? " completed" : ""}`}>{completed && <Check size={20} strokeWidth={3} aria-hidden="true" />}</span>
            <span>{day}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
