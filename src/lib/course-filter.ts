import type { CourseCardView } from "@/types/learning";

export function filterCourses(courses: CourseCardView[], search: string, level: string) {
  const query = search.trim().toLowerCase();
  return courses.filter(course => (level === "ALL" || course.level === level) && `${course.title} ${course.description}`.toLowerCase().includes(query));
}
