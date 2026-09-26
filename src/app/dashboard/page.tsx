import { requireUser } from "@/lib/current-user";
import { studentOverview, nodeHref } from "@/services/learning";
import { badgeViews } from "@/services/presentation";
import EmptyState from "@/components/learning/EmptyState";
import DashboardHero from "@/components/dashboard/DashboardHero";
import ContinueLearning from "@/components/dashboard/ContinueLearning"
import OverallProgress from "@/components/dashboard/OverallProgress";
import StreakCard from "@/components/dashboard/StreakCard";
import NextLesson from "@/components/dashboard/NextLesson";
import RoadmapProgress from "@/components/dashboard/RoadmapProgress";
import RecentAchievements from "@/components/dashboard/RecentAchievements";
import DashboardPromo from "@/components/dashboard/DashboardPromo";
import "@/styles/dashboard/dashboard.css";
export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const overview = await studentOverview(user.id);
  const state = overview.active;
  const earned = badgeViews(overview.badges).filter(b => b.status === "earned");
  const last = overview.attempts[0];
  const next = state?.current;
  return (
    <main className="dashboard">
      <DashboardHero name={user.name} />
      <section className="dashboard-sec2" aria-label="Learning overview">
        {state ? <ContinueLearning course={state.course.title} title={state.currentLesson?.title ?? state.course.quizzes.find(q => q.id === next?.quizId)?.title ?? "Course complete"} detail={state.currentLesson ? `Lesson ${state.currentLesson.order}` : "Learning roadmap"} progress={state.percentage} href={nodeHref(state, next)} courseHref={`/courses/${state.course.slug}`} /> : <EmptyState />}
        <OverallProgress overallProgress={{ percentage: overview.percentage, summary: [{ label: "Completed", lessons: overview.completed, status: "completed" }, { label: "In Progress", lessons: overview.states.reduce((n,s) => n+s.progress.filter(p => p.status === "IN_PROGRESS").length,0), status: "in-progress" }, { label: "Not Started", lessons: overview.states.reduce((n,s) => n+s.totalLessons-s.progress.filter(p => p.status !== "NOT_STARTED").length,0), status: "not-started" }] }} />
        <StreakCard learningStreak={overview.streak} />
      </section>
      <section className="dashboard-sec3" aria-label="Next steps">
        {state && next ? <NextLesson nextLesson={{ title: state.currentLesson?.title ?? "Checkpoint Quiz", module: state.course.title, duration: state.currentLesson ? `${Math.ceil(state.currentLesson.durationSeconds/60)} min` : "Quiz", href: nodeHref(state, next) }} /> : <EmptyState message={state ? "All required learning steps are complete." : "Enroll to see your next lesson."} />}
        <RoadmapProgress roadmapStages={state ? state.course.modules.map(m => ({ title: m.title, status: state.moduleComplete(m.id) ? "completed" : m.lessons.some(l => state.nodes.some(n => n.lessonId === l.id && n.status === "current")) || state.course.quizzes.some(q => q.moduleId === m.id && q.id === next?.quizId) ? "current" : "locked" })) : []} />
      </section>
      <section className="dashboard-sec4" aria-label="Achievements and inspiration">
        <RecentAchievements recentAchievements={earned.slice(0,2).map(b => ({ title: b.title, description: b.description, date: b.earnedDate ?? "", kind: b.icon === "play" ? "creator" : "quiz" }))} lastQuiz={last ? { title: last.quiz.title, score: last.score ?? 0, result: last.passed ? "Passed" : "Not Passed", href: `/quizzes/${last.quiz.slug}/result?attempt=${last.id}` } : null} />
        <DashboardPromo />
      </section>
    </main>
  );
}
