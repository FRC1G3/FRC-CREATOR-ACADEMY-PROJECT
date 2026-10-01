import { timed } from "@/lib/performance";
import Link from "next/link";
import RoadmapSummary from "@/components/roadmap/RoadmapSummary";
import RoadmapNode from "@/components/roadmap/RoadmapNode";
import { requireUser } from "@/lib/current-user";
import { courseState, studentOverview, nodeHref } from "@/services/learning";
import EmptyState from "@/components/learning/EmptyState";
import "@/styles/roadmap/roadmap.css";

async function RoadmapPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const user = await requireUser("/roadmap");
  const { course } = await searchParams;
  const state = course ? await courseState(user.id, course) : (await studentOverview(user.id)).active;
  if (!state?.enrollment) return <main className="roadmap-page"><div className="roadmap-container"><EmptyState /></div></main>;
  const roadmapNodes = state.nodes.map(n => ({ id:n.id, title: state.course.roadmapNodes.find(r => r.id === n.id)!.title, detail: n.type === "QUIZ" ? `${state.course.quizzes.find(q => q.id === n.quizId)?._count.questions ?? 0} questions` : n.type === "REWARD" ? "Learning milestone" : "Video lesson", status: n.status, kind: n.type === "REWARD" ? "reward" : n.type === "QUIZ" ? "quiz" : "module", href: n.status !== "locked" ? nodeHref(state,n) : undefined }));
  return (
    <main className="roadmap-page">
      <div className="roadmap-container">
        <header className="roadmap-heading">
          <Link href={`/courses/${state.course.slug}`}>{state.course.title}</Link>
          <h1>Your Learning Roadmap</h1>
          <p>One step at a time. Learn, complete checkpoints and grow as a creator.</p>
        </header>
        <RoadmapSummary roadmapSummary={{ percentage: state.percentage, lessons: `${state.completedLessons} of ${state.totalLessons} lessons`, modules: `${state.completedModules} / ${state.course.modules.length}`, quizzes: `${state.passed.size} / ${state.course.quizzes.length}`, current: state.currentLesson?.title ?? state.course.quizzes.find(q => q.id === state.current?.quizId)?.title ?? "Complete" }} />
        <ol className="roadmap-path" aria-label="Course learning stages">
          {roadmapNodes.map((node, index) => <RoadmapNode key={node.id} node={node} index={index} last={index === roadmapNodes.length - 1} />)}
        </ol>
      </div>
    </main>
  );
}

export default async function ProfiledPage(...args: Parameters<typeof RoadmapPage>) {
  return timed("route.roadmap", () => RoadmapPage(...args));
}
