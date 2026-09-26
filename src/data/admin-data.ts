import { BookOpen, SquarePlay, UsersRound, ChartNoAxesColumnIncreasing, Plus, NotebookPen, ClipboardList, Route, Trophy, Upload, House } from "lucide-react";

export const adminNavigation = [
  { label: "Overview", icon: House, href: "/admin" }, { label: "Courses", icon: BookOpen, href: "/admin/courses" },
  { label: "Lessons", icon: SquarePlay, href: "/admin/lessons" }, { label: "Quizzes", icon: ClipboardList, href: "/admin/quizzes" },
  { label: "Roadmap", icon: Route, href: "/admin/roadmap" }, { label: "Badges", icon: Trophy, href: "/admin/badges" },
  { label: "Students", icon: UsersRound, href: "/admin/students" },
];

export const adminStats = [
  { label: "Total Courses", value: "6", trend: "+2 this month", icon: BookOpen, tone: "red" },
  { label: "Total Lessons", value: "42", trend: "+8 this month", icon: SquarePlay, tone: "blue" },
  { label: "Total Students", value: "124", trend: "+18 this month", icon: UsersRound, tone: "purple" },
  { label: "Quiz Pass Rate", value: "86%", trend: "+6% this month", icon: ChartNoAxesColumnIncreasing, tone: "amber" },
];

export const adminActions = [
  { title: "New Course", description: "Create a new course", icon: Plus, tone: "red", href: "/admin/courses/new" },
  { title: "New Lesson", description: "Add lesson to a course", icon: NotebookPen, tone: "blue", href: "/admin/lessons/new" },
  { title: "New Quiz", description: "Create a quiz", icon: ClipboardList, tone: "purple", href: "/admin/quizzes/new" },
  { title: "Manage Roadmap", description: "Edit learning paths", icon: Route, tone: "amber", href: "/admin/roadmap" },
];

export const recentAdminCourses = [
  { id: 1, title: "YouTube Creator Mastery", description: "Complete guide to YouTube growth", lessons: 12, students: 86, status: "Published", updated: "Sep 20, 2026", image: "/images/dashboard/section2.png" },
  { id: 2, title: "Shorts Mastery", description: "Viral content creation", lessons: 8, students: 24, status: "Draft", updated: "Sep 18, 2026", image: "/images/profiles/youtubecircile.png" },
  { id: 3, title: "Video Editing Basics", description: "Learn professional editing", lessons: 10, students: 42, status: "Published", updated: "Sep 15, 2026", image: "/images/auth/auth-background.png" },
  { id: 4, title: "Content Strategy", description: "Plan, grow and monetize", lessons: 8, students: 18, status: "Draft", updated: "Sep 12, 2026", image: "/images/lessons/thumbnail-psychology.png" },
  { id: 5, title: "Analytics & Growth", description: "Data-driven YouTube growth", lessons: 12, students: 31, status: "Published", updated: "Sep 10, 2026", image: "/images/skills.png" },
];

export const adminActivity = [
  { title: "New course created", detail: "Shorts Mastery", time: "2 hours ago", icon: BookOpen, tone: "red" },
  { title: "Lesson updated", detail: "YouTube SEO Basics", time: "4 hours ago", icon: SquarePlay, tone: "purple" },
  { title: "Quiz created", detail: "Quiz 1: Content Strategy", time: "6 hours ago", icon: ClipboardList, tone: "purple" },
  { title: "Student enrolled", detail: "New student joined", time: "1 day ago", icon: UsersRound, tone: "green" },
  { title: "Badge updated", detail: "Consistent Creator", time: "1 day ago", icon: Trophy, tone: "amber" },
  { title: "Course published", detail: "Video Editing Basics", time: "2 days ago", icon: Upload, tone: "red" },
];

export const topAdminCourses = [
  { ...recentAdminCourses[0], performance: 92 },
  { ...recentAdminCourses[2], performance: 78 },
  { ...recentAdminCourses[4], performance: 74 },
];

// Admin-only fixtures. Forms and filters never persist changes.
export const adminCourses = recentAdminCourses.map((course, index) => ({
  ...course,
  modules: [6, 3, 4, 3, 4][index],
  level: index === 4 ? "Intermediate" : "Beginner",
  instructor: "Samir Mammadov",
  duration: ["4h 20m", "2h 10m", "3h 15m", "2h 40m", "3h 30m"][index],
  fullDescription: `${course.description}. Practical lessons, checkpoint quizzes and a clear learning path for creators.`,
}));

export const adminLessons = [
  { id: 1, title: "How YouTube Works", course: "YouTube Creator Mastery", module: "Module 1", duration: "12:34", status: "Published", order: 1 },
  { id: 2, title: "Finding Your Niche", course: "YouTube Creator Mastery", module: "Module 1", duration: "15:20", status: "Published", order: 2 },
  { id: 3, title: "Understanding Your Audience", course: "YouTube Creator Mastery", module: "Module 1", duration: "18:10", status: "Published", order: 3 },
  { id: 4, title: "Finding Video Ideas", course: "YouTube Creator Mastery", module: "Module 2", duration: "14:25", status: "Published", order: 4 },
  { id: 5, title: "Thumbnail Psychology", course: "YouTube Creator Mastery", module: "Module 2", duration: "16:40", status: "Published", order: 5 },
  { id: 6, title: "Writing Better Titles", course: "YouTube Creator Mastery", module: "Module 2", duration: "18:12", status: "Draft", order: 6 },
];

export const adminQuizzes = [
  { id: 1, title: "Fundamentals Check", course: "YouTube Creator Mastery", module: "Module 1", questions: 10, passScore: 80, attempts: 94, status: "Published" },
  { id: 2, title: "Strategy Check", course: "YouTube Creator Mastery", module: "Module 2", questions: 10, passScore: 80, attempts: 68, status: "Published" },
  { id: 3, title: "Video Production Check", course: "Video Editing Basics", module: "Module 1", questions: 8, passScore: 80, attempts: 0, status: "Draft" },
];

export const adminRoadmap = [
  { id: 1, title: "How YouTube Works", type: "Lesson", status: "Published", unlock: "Available at course start", icon: SquarePlay },
  { id: 2, title: "Finding Your Niche", type: "Lesson", status: "Published", unlock: "Complete the previous lesson", icon: SquarePlay },
  { id: 3, title: "Understanding Your Audience", type: "Lesson", status: "Published", unlock: "Complete the previous lesson", icon: SquarePlay },
  { id: 4, title: "Fundamentals Check", type: "Quiz", status: "Published", unlock: "Complete Module 1 lessons; pass score 80%", icon: ClipboardList },
  { id: 5, title: "Finding Video Ideas", type: "Lesson", status: "Published", unlock: "Pass Fundamentals Check", icon: SquarePlay },
  { id: 6, title: "Creator Starter", type: "Reward", status: "Published", unlock: "Complete the first roadmap section", icon: Trophy },
  { id: 7, title: "Shorts or Long-form", type: "Branch", status: "Draft", unlock: "Choose a path after Content Strategy", icon: Route },
];

export const adminBadges = [
  { id: 1, title: "Creator Starter", condition: "Complete your first roadmap section.", status: "Published", icon: SquarePlay },
  { id: 2, title: "Quiz Master", condition: "Pass 3 quizzes with 80% or higher.", status: "Published", icon: Trophy },
  { id: 3, title: "Consistent Creator", condition: "Maintain a 7-day learning streak.", status: "Published", icon: ChartNoAxesColumnIncreasing },
  { id: 4, title: "Shorts Specialist", condition: "Finish the Shorts module.", status: "Draft", icon: SquarePlay },
  { id: 5, title: "Analytics Explorer", condition: "Complete the Analytics section.", status: "Published", icon: ChartNoAxesColumnIncreasing },
  { id: 6, title: "Monetization Ready", condition: "Finish all monetization lessons.", status: "Draft", icon: Trophy },
];

export const adminStudents = [
  { id: 1, name: "Samir Mammadov", email: "samir@example.com", course: "YouTube Creator Mastery", progress: 68, lessons: "29 / 42", quizzes: "1 / 2", badges: 3, joined: "Sep 12, 2026", status: "Active" },
  { id: 2, name: "Aysel Aliyeva", email: "aysel@example.com", course: "YouTube Creator Mastery", progress: 42, lessons: "18 / 42", quizzes: "1 / 2", badges: 2, joined: "Sep 14, 2026", status: "Active" },
  { id: 3, name: "Murad Hasanov", email: "murad@example.com", course: "Video Editing Basics", progress: 20, lessons: "2 / 10", quizzes: "0 / 2", badges: 1, joined: "Sep 16, 2026", status: "Inactive" },
  { id: 4, name: "Leyla Karimova", email: "leyla@example.com", course: "Analytics & Growth", progress: 75, lessons: "9 / 12", quizzes: "2 / 2", badges: 4, joined: "Sep 18, 2026", status: "Active" },
];
