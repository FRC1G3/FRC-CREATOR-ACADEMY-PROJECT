import AdminPageHeader from "@/components/admin/AdminPageHeader";
import QuizForm from "@/components/admin/QuizForm";
import { adminCatalog } from "@/services/admin-queries";
export default async function Page() {return <><AdminPageHeader eyebrow="Quiz Management" title="New Quiz" description="Create academy content." /><QuizForm catalog={await adminCatalog()} /></>; }
