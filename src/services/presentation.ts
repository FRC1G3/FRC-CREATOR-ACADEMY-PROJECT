import "server-only";
import type { CourseState, studentOverview } from "./learning";
import { nodeHref } from "./learning";
import { percentage } from "@/lib/learning-rules";
import type { BadgeView, ModuleView } from "@/types/learning";
export const dateLabel = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const duration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
export function moduleViews(state: CourseState): ModuleView[] {
  return state.course.modules.map(module => ({ number: module.order, title: module.title, lessonCount: module.lessons.length, progress: percentage(module.lessons.filter(l => state.completed.has(l.id)).length, module.lessons.length), lessons: [
    ...module.lessons.map(l => { const node = state.nodes.find(n => n.lessonId === l.id); return { title: l.title, duration: duration(l.durationSeconds), status: node?.status ?? "locked", href: node && node.status !== "locked" ? nodeHref(state, node) : undefined }; }),
    ...state.course.quizzes.filter(q => q.moduleId === module.id).map(q => { const node = state.nodes.find(n => n.quizId === q.id); return { title: q.title, duration: `${q._count.questions} questions`, status: node?.status === "locked" ? "locked" : "quiz", href: node && node.status !== "locked" ? nodeHref(state, node) : undefined }; }),
  ] }));
}
export function badgeViews(badges: Awaited<ReturnType<typeof studentOverview>>["badges"]): BadgeView[] {
  const icons: Record<string, BadgeView["icon"]> = { Play: "play", Star: "star", Flame: "flame", Trophy: "crown", trophy: "crown", play: "play", star: "star", flame: "flame", crown: "crown" };
  return badges.map(b => ({ title: b.name, description: b.description, status: b.users.length ? "earned" : "locked", earnedDate: b.users[0] ? dateLabel(b.users[0].earnedAt) : null, icon: icons[b.icon] ?? "star" }));
}
