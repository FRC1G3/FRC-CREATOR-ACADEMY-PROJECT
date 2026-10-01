export type RoadmapTargetType = "LESSON" | "QUIZ" | "REWARD";
type Target = { id: string; title: string };
type Node = { lessonId: string | null; quizId: string | null; badgeId: string | null };

export function availableRoadmapTargets(type: RoadmapTargetType, course: { lessons: Target[]; quizzes: Target[]; roadmapNodes: Node[] } | undefined, badges: Target[]) {
  if (!course) return [];
  const used = new Set(course.roadmapNodes.flatMap(node => [node.lessonId, node.quizId, node.badgeId]).filter(Boolean));
  const targets = type === "LESSON" ? course.lessons : type === "QUIZ" ? course.quizzes : badges;
  return targets.filter(target => !used.has(target.id));
}

export function roadmapEmptyMessage(type: RoadmapTargetType, hasEligible: boolean) {
  const noun = type === "LESSON" ? "lessons" : type === "QUIZ" ? "quizzes" : "badges";
  return hasEligible ? `No available ${noun}. All eligible ${noun} are already in this roadmap.` : `No ${noun} are available yet.`;
}
