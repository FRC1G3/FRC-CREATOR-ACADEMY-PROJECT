"use client";

import { useState } from "react";
import { adminStudents } from "@/data/admin-data";
import AdminPageHeader from "./AdminPageHeader";
import AdminFilters, { AdminCourseFilter } from "./AdminFilters";
import AdminTable from "./AdminTable";
import AdminStatusBadge from "./AdminStatusBadge";

export default function StudentsManagement() {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [status, setStatus] = useState("");
  const students = adminStudents.filter((student) => `${student.name} ${student.email}`.toLowerCase().includes(search.toLowerCase()) && (!course || student.course === course) && (!status || student.status === status));

  return <>
    <AdminPageHeader eyebrow="Student Management" title="Students" description="View academy learners and their progress." />
    <AdminFilters label="Search students..." search={search} onSearch={setSearch}><AdminCourseFilter value={course} onChange={setCourse} /><select className="admin-select" aria-label="Filter by student status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option>Active</option><option>Inactive</option></select></AdminFilters>
    <AdminTable label="Students" columns={["Student", "Email", "Current Course", "Progress", "Lessons", "Quizzes", "Badges", "Joined", "Status", "Actions"]} empty={!students.length}>
      {students.map((student) => <tr key={student.id}>
        <th scope="row"><div className="admin-student-name"><span aria-hidden="true">{student.name.split(" ").map((part) => part[0]).join("")}</span>{student.name}</div></th><td>{student.email}</td><td>{student.course}</td>
        <td><div className="admin-student-progress"><span>{student.progress}%</span><progress value={student.progress} max={100} aria-label={`${student.name} course progress`} /></div></td>
        <td>{student.lessons}</td><td>{student.quizzes}</td><td>{student.badges}</td><td>{student.joined}</td><td><AdminStatusBadge status={student.status} /></td><td><button className="admin-button" type="button" disabled aria-label={`View ${student.name}`}>View</button></td>
      </tr>)}
    </AdminTable>
  </>;
}
