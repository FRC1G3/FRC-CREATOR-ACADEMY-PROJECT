"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, EllipsisVertical } from "lucide-react";
import { adminCourses } from "@/data/admin-data";
import AdminPageHeader from "./AdminPageHeader";
import AdminFilters from "./AdminFilters";
import AdminTable from "./AdminTable";
import AdminStatusBadge from "./AdminStatusBadge";

export default function CoursesManagement() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const courses = adminCourses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase()) && (status === "All" || course.status === status));

  return (
    <>
      <AdminPageHeader eyebrow="Course Management" title="Courses" description="Create, organize and manage your academy courses."><Link href="/admin/courses/new" className="admin-button admin-button-primary"><Plus size={17} />New Course</Link></AdminPageHeader>
      <AdminFilters label="Search courses..." search={search} onSearch={setSearch}><div className="admin-filter-tabs" role="group" aria-label="Course status">{["All", "Published", "Draft"].map((value) => <button key={value} type="button" aria-pressed={status === value} onClick={() => setStatus(value)}>{value}</button>)}</div></AdminFilters>
      <AdminTable label="Courses" columns={["Course", "Lessons", "Modules", "Students", "Status", "Last Updated", "Actions"]} empty={!courses.length}>
        {courses.map((course) => <tr key={course.id}>
          <th scope="row"><div className="admin-course-name"><Image src={course.image} alt="" width={56} height={42} /><div><strong>{course.title}</strong><small>{course.description}</small></div></div></th>
          <td>{course.lessons}</td><td>{course.modules}</td><td>{course.students}</td><td><AdminStatusBadge status={course.status} /></td><td>{course.updated}</td>
          <td><div className="admin-row-actions"><Link href={`/admin/courses/${course.id}/edit`} className="admin-button" aria-label={`Edit ${course.title}`}>Edit</Link><button type="button" disabled aria-label={`More actions for ${course.title}`}><EllipsisVertical size={17} /></button></div></td>
        </tr>)}
      </AdminTable>
    </>
  );
}
