import { timed } from "@/lib/performance";
import StudentsManagement from "@/components/admin/StudentsManagement";
import { adminCourseOptions, adminStudents } from "@/services/admin-queries";
async function Page() {
  const [rows,courses]=await Promise.all([adminStudents(),adminCourseOptions()]);
  return <StudentsManagement rows={rows} courses={courses} />;
}


export default async function ProfiledPage(...args: Parameters<typeof Page>) {
  return timed("route.admin-students", () => Page(...args));
}
