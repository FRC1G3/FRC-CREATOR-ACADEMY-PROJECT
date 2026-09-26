"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, EllipsisVertical } from "lucide-react";
import { adminLessons } from "@/data/admin-data";
import AdminPageHeader from "./AdminPageHeader";
import AdminFilters, { AdminCourseFilter } from "./AdminFilters";
import AdminTable from "./AdminTable";
import AdminStatusBadge from "./AdminStatusBadge";

export default function LessonsManagement() {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [module, setModule] = useState("");
  const lessons = adminLessons.filter((lesson) => lesson.title.toLowerCase().includes(search.toLowerCase()) && (!course || lesson.course === course) && (!module || lesson.module === module));

  return <>
    <AdminPageHeader eyebrow="Lesson Management" title="Lessons" description="Manage modules, lessons and lesson order."><Link href="/admin/lessons/new" className="admin-button admin-button-primary"><Plus size={17} />New Lesson</Link></AdminPageHeader>
    <AdminFilters label="Search lessons..." search={search} onSearch={setSearch}><AdminCourseFilter value={course} onChange={setCourse} /><select className="admin-select" aria-label="Filter by module" value={module} onChange={(event) => setModule(event.target.value)}><option value="">All modules</option><option>Module 1</option><option>Module 2</option></select></AdminFilters>
    <AdminTable label="Lessons" columns={["Lesson", "Course", "Module", "Duration", "Status", "Order", "Actions"]} empty={!lessons.length}>
      {lessons.map((lesson) => <tr key={lesson.id}><th scope="row">{lesson.title}</th><td>{lesson.course}</td><td>{lesson.module}</td><td>{lesson.duration}</td><td><AdminStatusBadge status={lesson.status} /></td><td>{lesson.order}</td><td><div className="admin-row-actions"><button type="button" disabled aria-label={`Edit ${lesson.title}`}>Edit</button><button type="button" disabled aria-label={`More actions for ${lesson.title}`}><EllipsisVertical size={17} /></button></div></td></tr>)}
    </AdminTable>
  </>;
}
