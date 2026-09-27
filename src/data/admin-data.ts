import { BookOpen, SquarePlay, UsersRound, Plus, NotebookPen, ClipboardList, Route, Trophy, House } from "lucide-react";

// Static navigation only; management records come from PostgreSQL.
export const adminNavigation = [
  { label: "Overview", icon: House, href: "/admin" }, { label: "Courses", icon: BookOpen, href: "/admin/courses" },
  { label: "Lessons", icon: SquarePlay, href: "/admin/lessons" }, { label: "Quizzes", icon: ClipboardList, href: "/admin/quizzes" },
  { label: "Roadmap", icon: Route, href: "/admin/roadmap" }, { label: "Badges", icon: Trophy, href: "/admin/badges" },
  { label: "Students", icon: UsersRound, href: "/admin/students" },
];

export const adminActions = [
  { title: "New Course", description: "Create a new course", icon: Plus, tone: "red", href: "/admin/courses/new" },
  { title: "New Lesson", description: "Add lesson to a course", icon: NotebookPen, tone: "blue", href: "/admin/lessons/new" },
  { title: "New Quiz", description: "Create a quiz", icon: ClipboardList, tone: "purple", href: "/admin/quizzes/new" },
  { title: "Manage Roadmap", description: "Edit learning paths", icon: Route, tone: "amber", href: "/admin/roadmap" },
];
