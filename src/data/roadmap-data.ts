// Static UI fixtures; no completion, quiz scoring or unlocking logic.
export const roadmapSummary = { percentage: 68, lessons: "20 of 29 lessons", modules: "4 / 10", quizzes: "1 / 2", current: "5. Thumbnail Psychology" };

export const roadmapNodes = [
  { title: "1. YouTube Basics", detail: "3 lessons", status: "completed", kind: "module" },
  { title: "2. Finding Your Niche", detail: "4 lessons", status: "completed", kind: "module" },
  { title: "3. Understanding Your Audience", detail: "3 lessons", status: "completed", kind: "module" },
  { title: "Quiz 1", detail: "8 questions", status: "completed", kind: "quiz" },
  { title: "4. Content Ideas", detail: "4 lessons", status: "completed", kind: "module" },
  { title: "5. Thumbnail Psychology", detail: "3 lessons", status: "current", kind: "module" },
  { title: "6. Better Titles", detail: "4 lessons", status: "locked", kind: "module" },
  { title: "Quiz 2", detail: "8 questions", status: "locked", kind: "quiz" },
  { title: "7. Video Production", detail: "4 lessons", status: "locked", kind: "module" },
  { title: "8. Editing Basics", detail: "4 lessons", status: "locked", kind: "module" },
  { title: "9. Analytics & Growth", detail: "4 lessons", status: "locked", kind: "module" },
  { title: "10. Monetization", detail: "3 lessons", status: "locked", kind: "module" },
  { title: "Final Badge", detail: "Complete all modules", status: "locked", kind: "reward" },
];
