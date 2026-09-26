import Link from "next/link";
import { ChartNoAxesColumnIncreasing, ArrowRight, GraduationCap, FileCheck, Flame } from "lucide-react";
import { profilePreview as profile } from "@/data/profile-data";

export default function LearningProgress() {
  return (
    <section className="profile-learning app-card">
      <div className="profile-section-heading"><ChartNoAxesColumnIncreasing /><div><h2>Learning Progress</h2><p>Track your learning journey and see how far you&apos;ve come.</p></div><Link href="/roadmap">View Learning Roadmap <ArrowRight /></Link></div>
      <div className="profile-stat-grid">
        <div className="profile-stat app-card profile-overall"><div className="profile-progress-ring" role="img" aria-label={`${profile.progress}% completed`}><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" /><circle className="profile-ring-fill" cx="50" cy="50" r="42" pathLength="100" strokeDasharray={`${profile.progress} 100`} /></svg><div><strong>{profile.progress}%</strong><small>Completed</small></div></div><div><h3>Overall Progress</h3><p>{profile.completed} of {profile.total} lessons completed</p><progress value={profile.progress} max={100} aria-label="Overall learning progress" /></div></div>
        <div className="profile-stat app-card"><span className="profile-stat-icon"><GraduationCap /></span><div><strong>{profile.completed}</strong><h3>Lessons Completed</h3><p>of {profile.total}</p></div></div>
        <div className="profile-stat app-card"><span className="profile-stat-icon"><FileCheck /></span><div><strong>{profile.quizAverage}%</strong><h3>Quizzes Passed</h3><p>Average Score</p></div></div>
        <div className="profile-stat app-card"><span className="profile-stat-icon"><Flame /></span><div><strong>{profile.streak} days</strong><h3>Current Streak</h3><p>Keep going!</p></div></div>
      </div>
    </section>
  );
}
