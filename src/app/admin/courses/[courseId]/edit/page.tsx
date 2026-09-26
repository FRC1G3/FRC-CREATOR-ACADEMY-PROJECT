import { notFound } from "next/navigation";
import { adminCourses } from "@/data/admin-data";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CourseForm from "@/components/admin/CourseForm";

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = adminCourses.find((item) => String(item.id) === courseId);
  if (!course) notFound();

  return <><AdminPageHeader eyebrow="Course Management" title="Edit Course" description={`Update the presentation of ${course.title}.`} /><CourseForm key={course.id} course={course} /></>;
}
