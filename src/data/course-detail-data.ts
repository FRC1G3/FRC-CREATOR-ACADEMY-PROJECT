// Static curriculum preview for the Course Detail UI.
export const courseModules = [
  {
    number: 1, title: "YouTube Fundamentals", progress: 100, lessonCount: 4,
    lessons: [
      { title: "1. How YouTube Works", duration: "12:34", status: "completed" },
      { title: "2. Finding Your Niche", duration: "15:20", status: "completed" },
      { title: "3. Understanding Your Audience", duration: "18:10", status: "completed" },
      { title: "Quiz 1", duration: "10 questions", status: "quiz" },
    ],
  },
  {
    number: 2, title: "Content Strategy", progress: 33, lessonCount: 4,
    lessons: [
      { title: "4. Finding Video Ideas", duration: "14:25", status: "completed" },
      { title: "5. Thumbnail Psychology", duration: "16:40", status: "current" },
      { title: "6. Writing Better Titles", duration: "18:12", status: "locked" },
      { title: "Quiz 2", duration: "10 questions", status: "quiz" },
    ],
  },
  { number: 3, title: "Video Production", progress: 0, lessonCount: 4, lessons: [] },
  { number: 4, title: "Editing Mastery", progress: 0, lessonCount: 4, lessons: [] },
  { number: 5, title: "Growth & Analytics", progress: 0, lessonCount: 4, lessons: [] },
  { number: 6, title: "Monetization & Business", progress: 0, lessonCount: 4, lessons: [] },
];
