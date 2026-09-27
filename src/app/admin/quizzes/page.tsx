import QuizzesManagement from "@/components/admin/QuizzesManagement";
import { adminQuizzes } from "@/services/admin-queries";
export default async function Page() { return <QuizzesManagement rows={await adminQuizzes()} />; }
