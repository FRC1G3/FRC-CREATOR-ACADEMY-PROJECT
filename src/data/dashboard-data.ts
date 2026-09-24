// Temporary UI data; no progress tracking or streak logic is connected yet.
export const lastQuiz = { title: "YouTube Fundamentals", score: 85, result: "Passed" };

export const nextLesson = {
  title: "Understanding CTR",
  module: "Module 2 · Lesson 6",
  duration: "12 min",
};

export const roadmapStages = [
  { title: "Basics", status: "completed" },
  { title: "Niche", status: "completed" },
  { title: "Audience", status: "completed" },
  { title: "Content Strategy", status: "current" },
  { title: "Production", status: "locked" },
  { title: "Growth", status: "locked" },
];

export const recentAchievements = [
  { title: "Creator Starter", description: "Completed your first lesson", date: "Sep 12, 2026", kind: "creator" },
  { title: "Quiz Master", description: "Scored 80%+ in a quiz", date: "Sep 18, 2026", kind: "quiz" },
];

export const overallProgress = {
  percentage: 68,
  summary: [
    { label: "Completed", lessons: 28, status: "completed" },
    { label: "In Progress", lessons: 7, status: "in-progress" },
    { label: "Not Started", lessons: 6, status: "not-started" },
  ],
};

export const learningStreak = {
  days: 7,
  week: [
    { day: "Mon", completed: true },
    { day: "Tue", completed: true },
    { day: "Wed", completed: true },
    { day: "Thu", completed: true },
    { day: "Fri", completed: true },
    { day: "Sat", completed: true },
    { day: "Sun", completed: false },
  ],
};
