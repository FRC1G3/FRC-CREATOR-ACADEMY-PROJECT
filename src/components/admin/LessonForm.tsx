"use client";

import Link from "next/link";
import { adminCourses } from "@/data/admin-data";
import AdminFormField from "./AdminFormField";

export default function LessonForm() {
  return <form className="app-card admin-editor" onSubmit={(event) => event.preventDefault()}>
    <div className="admin-form-section"><h2>Lesson details</h2><p>Place your lesson in a course and module.</p></div>
    <div className="admin-form-grid">
      <AdminFormField label="Course"><select name="course">{adminCourses.map((course) => <option key={course.id}>{course.title}</option>)}</select></AdminFormField>
      <AdminFormField label="Module"><select name="module"><option>Module 1</option><option>Module 2</option><option>Module 3</option></select></AdminFormField>
      <div className="admin-field-full"><AdminFormField label="Lesson Title"><input name="title" placeholder="e.g. Thumbnail Psychology" /></AdminFormField></div>
      <div className="admin-field-full"><AdminFormField label="Description"><textarea name="description" rows={4} placeholder="Describe this lesson and its learning goals" /></AdminFormField></div>
      <div className="admin-field-full"><AdminFormField label="Video URL"><input name="video" type="url" placeholder="https://example.com/video" /></AdminFormField></div>
      <AdminFormField label="Duration"><input name="duration" placeholder="16:40" /></AdminFormField>
      <AdminFormField label="Order"><input name="order" type="number" min={1} defaultValue={1} /></AdminFormField>
      <AdminFormField label="Status"><select name="status"><option>Draft</option><option>Published</option></select></AdminFormField>
    </div>
    <div className="admin-form-footer"><p>UI preview only. No video upload or saving.</p><div><Link className="admin-button" href="/admin/lessons">Cancel</Link><button className="admin-button admin-button-primary" type="button" disabled>Save Lesson</button></div></div>
  </form>;
}
