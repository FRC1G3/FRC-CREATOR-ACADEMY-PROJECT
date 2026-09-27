import StudentsManagement from "@/components/admin/StudentsManagement";
import { adminStudents } from "@/services/admin-queries";
export default async function Page() { return <StudentsManagement rows={await adminStudents()} />; }
