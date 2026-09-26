// Static UI examples; no badge earning or progress calculations.
export const achievementSummary = { earned: 3, total: 6, progress: 50, next: "Complete Analytics Module" };

export const achievementBadges = [
  { title: "Creator Starter", description: "Complete your first roadmap section.", status: "earned", earnedDate: "Sep 12, 2026", icon: "play" },
  { title: "Quiz Master", description: "Pass 3 quizzes with 80%+.", status: "earned", earnedDate: "Sep 15, 2026", icon: "star" },
  { title: "Consistent Creator", description: "Maintain a 7-day streak.", status: "earned", earnedDate: "Sep 18, 2026", icon: "flame" },
  { title: "Shorts Specialist", description: "Finish the Shorts module.", status: "locked", earnedDate: null, icon: "shorts" },
  { title: "Analytics Explorer", description: "Complete the Analytics section.", status: "locked", earnedDate: null, icon: "chart" },
  { title: "Monetization Ready", description: "Finish all monetization lessons.", status: "locked", earnedDate: null, icon: "crown" },
] as const;
