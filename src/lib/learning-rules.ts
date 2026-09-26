export function percentage(completed: number, total: number) { return total > 0 ? Math.round(completed / total * 100) : 0; }
export function passes(score: number, requirement = 80) { return score >= requirement; }
export type LearningNode = { id: string; type: "LESSON" | "QUIZ" | "REWARD"; lessonId: string | null; quizId: string | null; badgeId: string | null };
export function roadmapStates(nodes: LearningNode[], enrolled: boolean, lessons: Set<string>, quizzes: Set<string>, badges: Set<string>) {
  let unlocked = enrolled;
  return nodes.map(node => {
    const completed = node.type === "LESSON" ? lessons.has(node.lessonId ?? "") : node.type === "QUIZ" ? quizzes.has(node.quizId ?? "") : badges.has(node.badgeId ?? "");
    const status = completed ? "completed" : unlocked ? "current" : "locked";
    // Rewards celebrate learning; an unrelated badge condition must not deadlock the course.
    if (node.type !== "REWARD" && !completed) unlocked = false;
    return { ...node, status };
  });
}
export function scoreAnswers(questions: { id: string; options: { id: string; isCorrect: boolean }[] }[], answers: { questionId: string; optionId: string }[], requirement = 80) {
  if (!questions.length || answers.length !== questions.length || new Set(answers.map(a => a.questionId)).size !== questions.length) throw new Error("Answer every question once.");
  const rows = answers.map(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    const option = question?.options.find(o => o.id === answer.optionId);
    if (!question || !option || question.options.filter(o => o.isCorrect).length !== 1) throw new Error("Invalid quiz answers.");
    return { questionId: question.id, selectedOptionId: option.id, isCorrect: option.isCorrect };
  });
  const correct = rows.filter(row => row.isCorrect).length;
  // Keep two decimals. Do not round a score below the pass boundary up to a pass.
  const raw = correct / questions.length * 100;
  return { rows, correct, score: Math.round(raw * 100) / 100, passed: passes(raw, requirement) };
}
export function streak(dates: Date[], now = new Date()) {
  const days = new Set(dates.map(date => date.toISOString().slice(0, 10)));
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let count = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) { count++; cursor.setUTCDate(cursor.getUTCDate() - 1); }
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  const week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => { const date = new Date(monday); date.setUTCDate(date.getUTCDate() + index); return { day, completed: days.has(date.toISOString().slice(0, 10)) }; });
  return { days: count, week };
}
export function badgeMet(type: string, target: number | null, stats: { modules: number; courses: number; quizzes: number; streak: number }) {
  switch (type) {
    case "FIRST_SECTION_COMPLETE": return stats.modules >= 1;
    case "MODULE_COMPLETE": return stats.modules >= (target ?? 1);
    case "COURSE_COMPLETE": return stats.courses >= (target ?? 1);
    case "QUIZ_COUNT": return stats.quizzes >= (target ?? 1);
    case "STREAK": return stats.streak >= (target ?? 1);
    default: return false;
  }
}
