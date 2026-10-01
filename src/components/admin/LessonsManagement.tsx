"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { adminLessons } from "@/services/admin-queries";
import { AdminCommandButton } from "./AdminEditor";
import AdminPageHeader from "./AdminPageHeader";
import AdminFilters from "./AdminFilters";
import { filterAdminLessons } from "@/lib/admin-lesson-filters";
import AdminTable from "./AdminTable";
import AdminStatusBadge from "./AdminStatusBadge";

export default function LessonsManagement({ rows, catalog }: { rows: Awaited<ReturnType<typeof adminLessons>>; catalog: { id: string; title: string; modules: { id: string; title: string }[] }[] }) {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [module, setModule] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("");
  const lessons = filterAdminLessons(rows, { search, course, module, status, sort });

  return <>
    <AdminPageHeader eyebrow="Lesson Management" title="Lessons" description="Manage modules, lessons and lesson order."><Link href="/admin/lessons/new" className="admin-button admin-button-primary"><Plus size={17} />New Lesson</Link></AdminPageHeader>
    <AdminFilters label="Search lessons..." search={search} onSearch={setSearch}>
      <select className="admin-select" aria-label="Filter by course" value={course} onChange={e => { setCourse(e.target.value); setModule(""); }}><option value="">All courses</option>{catalog.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
      <select className="admin-select" aria-label="Filter by module" value={module} onChange={e => setModule(e.target.value)}><option value="">All modules</option>{catalog.filter(item => !course || item.id === course).flatMap(item => item.modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>))}</select>
      <select className="admin-select" aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option><option>Published</option><option>Draft</option></select>
      <select className="admin-select" aria-label="Sort lessons" value={sort} onChange={e => setSort(e.target.value)}><option value="">Default / order</option><option value="az">A–Z</option><option value="za">Z–A</option></select>
    </AdminFilters>
    <AdminTable label="Lessons" columns={["Lesson", "Course", "Module", "Duration", "Status", "Order", "Actions"]} empty={!lessons.length}>
      {lessons.map((lesson) => <tr key={lesson.id}><th scope="row">{lesson.title}</th><td>{lesson.course}</td><td>{lesson.module}</td><td>{lesson.duration}</td><td><AdminStatusBadge status={lesson.status} /></td><td>{lesson.order}</td><td><div className="admin-row-actions"><Link className="admin-button" href={"/admin/lessons/"+lesson.id+"/edit"}>Edit</Link><AdminCommandButton entity="lesson" id={lesson.id} operation={lesson.status === "Published" ? "unpublish" : "publish"} label={lesson.status === "Published" ? "Unpublish" : "Publish"} /><AdminCommandButton entity="lesson" id={lesson.id} /></div></td></tr>)}
    </AdminTable>
  </>;
}
