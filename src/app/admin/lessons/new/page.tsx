import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LessonForm from "@/components/admin/LessonForm";

export default function NewLessonFormPage() {
  return <><AdminPageHeader eyebrow="lessons Management" title="New Lesson" description="Add a lesson to your course and module." /><LessonForm /></>;
}
