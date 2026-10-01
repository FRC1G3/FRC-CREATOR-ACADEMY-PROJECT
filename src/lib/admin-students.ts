import { learningProgress } from "./learning-rules";
export type AdminProgressStatus = "Not Started" | "In Progress" | "Completed";
export function progressStatus(completed: number, total: number, _completedAt: Date | string | null, hasActivity = false): AdminProgressStatus {
  if (total > 0 && completed >= total) return "Completed";
  return completed > 0 || hasActivity ? "In Progress" : "Not Started";
}
type ProgressCourse = { id: string; title: string; modules: { lessons: { id: string }[] }[]; quizzes: { id: string }[] };
export function adminCourseProgress(course: ProgressCourse, progress: { lessonId: string; status?: string }[], attempts: { quizId: string; passed: boolean | null; completedAt: Date | null }[]) {
  const ids = new Set(course.modules.flatMap(m => m.lessons.map(l => l.id)));
  const completedLessons = new Set(progress.filter(p => ids.has(p.lessonId) && p.status === "COMPLETED").map(p => p.lessonId)).size;
  const quizIds = new Set(course.quizzes.map(q => q.id));
  const passed = new Set(attempts.filter(a => quizIds.has(a.quizId) && a.passed && a.completedAt).map(a => a.quizId)).size;
  const units = learningProgress(completedLessons, ids.size, passed, quizIds.size);
  const started = progress.some(p => ids.has(p.lessonId) && p.status !== "NOT_STARTED") || attempts.some(a => quizIds.has(a.quizId));
  return { id: course.id, title: course.title, completed: units.completed, total: units.total, completedLessons, progress: units.percentage, status: progressStatus(units.completed, units.total, null, started) };
}
