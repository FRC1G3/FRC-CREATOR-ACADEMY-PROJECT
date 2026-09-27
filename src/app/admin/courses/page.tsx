import CoursesManagement from "@/components/admin/CoursesManagement";
import { adminCourses } from "@/services/admin-queries";
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}) { const {q}=await searchParams;return <CoursesManagement rows={await adminCourses()} initialSearch={q} />; }
