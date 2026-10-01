export function filterAdminQuizzes<T extends { title: string; courseId: string }>(rows: T[], search: string, courseId: string) {
  return rows.filter(quiz => quiz.title.toLowerCase().includes(search.trim().toLowerCase()) && (!courseId || quiz.courseId === courseId));
}
