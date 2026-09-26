"use client";

import Link from "next/link";
import { adminCourses } from "@/data/admin-data";
import AdminFormField from "./AdminFormField";

export default function CourseForm({ course }: { course?: (typeof adminCourses)[number] }) {
  return <form className="app-card admin-editor" onSubmit={(event) => event.preventDefault()}>
    <div className="admin-form-section"><h2>Course details</h2><p>Set up the content and presentation of your course.</p></div>
    <div className="admin-form-grid">
      <AdminFormField label="Course Title"><input name="title" placeholder="e.g. YouTube Creator Mastery" defaultValue={course?.title} /></AdminFormField>
      <AdminFormField label="Instructor"><input name="instructor" placeholder="Instructor name" defaultValue={course?.instructor ?? "Samir Mammadov"} /></AdminFormField>
      <div className="admin-field-full"><AdminFormField label="Short Description"><input name="description" placeholder="A short introduction to this course" defaultValue={course?.description} /></AdminFormField></div>
      <div className="admin-field-full"><AdminFormField label="Full Description"><textarea name="fullDescription" rows={5} placeholder="What will students learn?" defaultValue={course?.fullDescription} /></AdminFormField></div>
      <AdminFormField label="Level"><select name="level" defaultValue={course?.level ?? "Beginner"}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></AdminFormField>
      <AdminFormField label="Status"><select name="status" defaultValue={course?.status ?? "Draft"}><option>Draft</option><option>Published</option></select></AdminFormField>
      <AdminFormField label="Thumbnail URL"><input name="thumbnail" placeholder="https://example.com/thumbnail.png" defaultValue={course?.image} /></AdminFormField>
      <AdminFormField label="Estimated Duration"><input name="duration" placeholder="e.g. 4h 20m" defaultValue={course?.duration} /></AdminFormField>
    </div>
    <div className="admin-form-footer"><p>UI preview only. Changes are not saved.</p><div><Link className="admin-button" href="/admin/courses">Cancel</Link><button className="admin-button" type="button" disabled>Save Draft</button><button className="admin-button admin-button-primary" type="button" disabled>Publish Course</button></div></div>
  </form>;
}
