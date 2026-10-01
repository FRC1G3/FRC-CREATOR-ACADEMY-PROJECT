import { timed } from "@/lib/performance";
import CoursesManagement from "@/components/admin/CoursesManagement";
import { adminCourses } from "@/services/admin-queries";
async function Page({searchParams}:{searchParams:Promise<{q?:string}>}) { const {q}=await searchParams;return <CoursesManagement rows={await adminCourses()} initialSearch={q} />; }

export default async function ProfiledPage(...args: Parameters<typeof Page>) {
  return timed("route.admin-courses", () => Page(...args));
}
