import type { Catalog, LessonEdit } from "@/types/admin";
import AdminFormField from "./AdminFormField";
import AdminEditor from "./AdminEditor";
import CourseModuleFields from "./CourseModuleFields";
export default function LessonForm({ catalog, lesson }: { catalog:Catalog; lesson?:LessonEdit }) {
  return <AdminEditor entity="lesson" id={lesson?.id} cancel="/admin/lessons">
    <div className="admin-form-section"><h2>Lesson details</h2><p>Place your lesson in a course and module.</p></div>
    <div className="admin-form-grid">
      <CourseModuleFields catalog={catalog} courseId={lesson?.module.courseId} moduleId={lesson?.moduleId} fixed={Boolean(lesson)} />
      <AdminFormField label="Lesson Title"><input name="title" required defaultValue={lesson?.title} /></AdminFormField>
      <AdminFormField label="Slug (blank generates from title)"><input name="slug" defaultValue={lesson?.slug} /></AdminFormField>
      <div className="admin-field-full"><AdminFormField label="Description"><textarea name="description" rows={4} defaultValue={lesson?.description} /></AdminFormField></div>
      <div className="admin-field-full"><AdminFormField label="Video URL (YouTube or direct video)"><input name="videoUrl" defaultValue={lesson?.videoUrl ?? ""} /></AdminFormField></div>
      <AdminFormField label="Thumbnail URL"><input name="thumbnailUrl" defaultValue={lesson?.thumbnailUrl ?? ""} /></AdminFormField>
      <AdminFormField label="Duration (seconds)"><input name="durationSeconds" type="number" min={0} defaultValue={lesson?.durationSeconds ?? 0} /></AdminFormField>
      <AdminFormField label="Order"><input name="order" type="number" min={1} defaultValue={lesson?.order ?? 1} /></AdminFormField>
      <AdminFormField label="Status"><select name="status" defaultValue={lesson?.status ?? "DRAFT"}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></AdminFormField>
    </div>
  </AdminEditor>;
}
