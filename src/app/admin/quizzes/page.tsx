import { timed } from "@/lib/performance";
import QuizzesManagement from "@/components/admin/QuizzesManagement";
import { adminCourseOptions, adminQuizzes } from "@/services/admin-queries";
async function Page() { const [rows,courses]=await Promise.all([adminQuizzes(),adminCourseOptions()]); return <QuizzesManagement rows={rows} courses={courses} />; }

export default async function ProfiledPage(...args: Parameters<typeof Page>) {
  return timed("route.admin-quizzes", () => Page(...args));
}
