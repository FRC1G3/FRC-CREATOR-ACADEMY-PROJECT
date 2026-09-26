// Profile UI fixtures only. No real account, activity or YouTube connection.
export const profilePreview = {
  name: "Samir Mammadov", role: "Creator Member", joined: "Sep 12, 2026",
  avatar: "/images/profiles/harun.jpg",
  bio: "Passionate about helping creators grow through education, strategy, and consistent action. Learning, building, and sharing the journey.",
  progress: 68, completed: 41, total: 60, quizAverage: 86, streak: 12, badges: 3,
  channel: "F.R.C", subscribers: "246K", videos: "836", views: "150M",
};
export const profileActivity = [
  { title: "Completed lesson", detail: "Content Planning Essentials", time: "2 hours ago", kind: "completed" },
  { title: "Passed quiz", detail: "Quiz 1: Content Strategy", time: "4 hours ago", kind: "quiz" },
  { title: "Started lesson", detail: "YouTube SEO Basics", time: "1 day ago", kind: "started" },
  { title: "Earned badge", detail: "Consistent Creator", time: "2 days ago", kind: "badge" },
  { title: "Completed lesson", detail: "Channel Branding", time: "3 days ago", kind: "completed" },
] as const;
