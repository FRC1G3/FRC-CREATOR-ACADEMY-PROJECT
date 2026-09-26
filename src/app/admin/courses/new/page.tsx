import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CourseForm from "@/components/admin/CourseForm";

export default function NewCourseFormPage() {
  return <><AdminPageHeader eyebrow="courses Management" title="New Course" description="Create the outline for your next academy course." /><CourseForm /></>;
}
