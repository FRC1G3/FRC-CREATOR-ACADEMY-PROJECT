export type LessonFilters = { search: string; course: string; module: string; status: string; sort: string };
export function filterAdminLessons<T extends { title: string; courseId: string; moduleId: string; status: string }>(rows: T[], filters: LessonFilters): T[] {
  const search = filters.search.trim().toLowerCase();
  const result = rows.filter(row => row.title.toLowerCase().includes(search) && (!filters.course || row.courseId === filters.course) && (!filters.module || row.moduleId === filters.module) && (!filters.status || row.status === filters.status));
  if (filters.sort === "az") result.sort((a, b) => a.title.localeCompare(b.title));
  if (filters.sort === "za") result.sort((a, b) => b.title.localeCompare(a.title));
  return result;
}
