import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LessonForm from "@/components/admin/LessonForm";
import { adminCatalog } from "@/services/admin-queries";
export default async function Page() {return <><AdminPageHeader eyebrow="Lesson Management" title="New Lesson" description="Create academy content." /><LessonForm catalog={await adminCatalog()} /></>; }
