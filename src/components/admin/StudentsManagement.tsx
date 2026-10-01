"use client";

import { useState } from "react";
import type { adminStudents } from "@/services/admin-queries";
import Link from "next/link";
import AdminPageHeader from "./AdminPageHeader";
import AdminFilters from "./AdminFilters";
import AdminTable from "./AdminTable";
import AdminStatusBadge from "./AdminStatusBadge";

export default function StudentsManagement({ rows, courses }: { rows: Awaited<ReturnType<typeof adminStudents>>; courses:{id:string;title:string}[] }) {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [status, setStatus] = useState(""),[progress,setProgress]=useState("");
  const students = rows.filter((student) => {const selected=student.courseProgress.find(item=>item.id===course);const currentProgress=course?selected?.status:student.progressStatus;return `${student.name} ${student.email}`.toLowerCase().includes(search.toLowerCase()) && (!course || Boolean(selected)) && (!status || student.status === status) && (!progress || currentProgress===progress);});

  return <>
    <AdminPageHeader eyebrow="Student Management" title="Students" description="View academy learners and their progress." />
    <AdminFilters label="Search students..." search={search} onSearch={setSearch}><select className="admin-select" aria-label="Filter by course" value={course} onChange={event=>setCourse(event.target.value)}><option value="">All courses</option>{courses.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select><select className="admin-select" aria-label="Filter by enrollment status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All enrollment statuses</option><option>Active</option><option>Inactive</option></select><select className="admin-select" aria-label="Filter by progress" value={progress} onChange={event=>setProgress(event.target.value)}><option value="">All progress</option><option>Not Started</option><option>In Progress</option><option>Completed</option></select></AdminFilters>
    <AdminTable label="Students" columns={["Student", "Email", "Enrolled Courses", "Progress", "Lessons", "Quiz Attempts", "Badges", "Joined", "Status", "Actions"]} empty={!students.length}>
      {students.map((student) => <tr key={student.id}>
        <th scope="row"><div className="admin-student-name"><span aria-hidden="true">{student.name.split(" ").map((part) => part[0]).join("")}</span>{student.name}</div></th><td>{student.email}</td><td>{student.course}</td>
        <td><div className="admin-student-progress"><span>{course?(student.courseProgress.find(item=>item.id===course)?.progress ?? 0):student.progress}%</span><progress value={course?(student.courseProgress.find(item=>item.id===course)?.progress ?? 0):student.progress} max={100} aria-label={`${student.name} course progress`} /></div></td>
        <td>{student.lessons}</td><td>{student.quizzes}</td><td>{student.badges}</td><td>{student.joined}</td><td><AdminStatusBadge status={student.status} /></td><td><Link className="admin-button" href={"/admin/students/"+student.id}>View</Link></td>
      </tr>)}
    </AdminTable>
  </>;
}
