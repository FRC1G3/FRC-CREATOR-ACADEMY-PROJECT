import { timed } from "@/lib/performance";
import LessonsManagement from "@/components/admin/LessonsManagement";
import { adminLessons, adminCatalog } from "@/services/admin-queries";
async function Page() {
  const [rows, courses] = await Promise.all([adminLessons(), adminCatalog()]);
  const catalog = courses.map(course => ({ id: course.id, title: course.title, modules: course.modules.map(module => ({ id: module.id, title: module.title })) }));
  return <LessonsManagement rows={rows} catalog={catalog} />;
}

export default async function ProfiledPage(...args: Parameters<typeof Page>) {
  return timed("route.admin-lessons", () => Page(...args));
}
