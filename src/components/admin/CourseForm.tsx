import type { Course } from "@/generated/prisma/client";
import AdminFormField from "./AdminFormField";
import AdminEditor from "./AdminEditor";
import AdminImageField from "./AdminImageField";
export default function CourseForm({ course }: { course?: Course }) {
  return <AdminEditor entity="course" id={course?.id} cancel="/admin/courses">
    <div className="admin-form-section"><h2>Course details</h2><p>Set up the content and presentation of your course.</p></div>
    <div className="admin-form-grid">
      <AdminFormField label="Course Title"><input name="title" required defaultValue={course?.title} /></AdminFormField>
      <AdminFormField label="Slug (blank generates from title)"><input name="slug" defaultValue={course?.slug} /></AdminFormField>
      <AdminFormField label="Instructor"><input name="instructorName" required defaultValue={course?.instructorName ?? "F.R.C"} /></AdminFormField>
      <AdminFormField label="Short Description"><input name="shortDescription" defaultValue={course?.shortDescription} /></AdminFormField>
      <div className="admin-field-full"><AdminFormField label="Full Description"><textarea name="description" rows={5} defaultValue={course?.description} /></AdminFormField></div>
      <AdminFormField label="Level"><select name="level" defaultValue={course?.level ?? "BEGINNER"}><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></select></AdminFormField>
      <AdminFormField label="Status"><select name="status" defaultValue={course?.status ?? "DRAFT"}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></AdminFormField>
      <AdminImageField value={course?.thumbnailUrl} />
      <AdminFormField label="Estimated Duration (minutes)"><input name="estimatedDuration" type="number" min={0} defaultValue={course?.estimatedDuration ?? ""} /></AdminFormField>
    </div>
  </AdminEditor>;
}
