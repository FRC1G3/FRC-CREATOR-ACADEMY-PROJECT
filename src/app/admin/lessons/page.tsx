import LessonsManagement from "@/components/admin/LessonsManagement";
import { adminLessons } from "@/services/admin-queries";
export default async function Page() { return <LessonsManagement rows={await adminLessons()} />; }
