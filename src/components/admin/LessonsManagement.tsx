"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { adminLessons } from "@/services/admin-queries";
import { AdminCommandButton } from "./AdminEditor";
import AdminPageHeader from "./AdminPageHeader";
import AdminFilters, { AdminCourseFilter } from "./AdminFilters";
import AdminTable from "./AdminTable";
import AdminStatusBadge from "./AdminStatusBadge";

export default function LessonsManagement({ rows }: { rows: Awaited<ReturnType<typeof adminLessons>> }) {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [module, setModule] = useState("");
  const lessons = rows.filter((lesson) => lesson.title.toLowerCase().includes(search.toLowerCase()) && (!course || lesson.course === course) && (!module || lesson.module === module));

  return <>
    <AdminPageHeader eyebrow="Lesson Management" title="Lessons" description="Manage modules, lessons and lesson order."><Link href="/admin/lessons/new" className="admin-button admin-button-primary"><Plus size={17} />New Lesson</Link></AdminPageHeader>
    <AdminFilters label="Search lessons..." search={search} onSearch={setSearch}><AdminCourseFilter value={course} onChange={value => { setCourse(value); setModule(""); }} courses={[...new Set(rows.flatMap(row => [row.course]))]} /><select className="admin-select" aria-label="Filter by module" value={module} onChange={(event) => setModule(event.target.value)}><option value="">All modules</option>{[...new Set(rows.filter(row => !course || row.course === course).map(row => row.module))].map(title => <option key={title}>{title}</option>)}</select></AdminFilters>
    <AdminTable label="Lessons" columns={["Lesson", "Course", "Module", "Duration", "Status", "Order", "Actions"]} empty={!lessons.length}>
      {lessons.map((lesson) => <tr key={lesson.id}><th scope="row">{lesson.title}</th><td>{lesson.course}</td><td>{lesson.module}</td><td>{lesson.duration}</td><td><AdminStatusBadge status={lesson.status} /></td><td>{lesson.order}</td><td><div className="admin-row-actions"><Link className="admin-button" href={"/admin/lessons/"+lesson.id+"/edit"}>Edit</Link><AdminCommandButton entity="lesson" id={lesson.id} /></div></td></tr>)}
    </AdminTable>
  </>;
}
