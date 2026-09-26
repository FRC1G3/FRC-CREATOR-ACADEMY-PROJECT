"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { adminQuizzes } from "@/data/admin-data";
import AdminPageHeader from "./AdminPageHeader";
import AdminFilters, { AdminCourseFilter } from "./AdminFilters";
import AdminTable from "./AdminTable";
import AdminStatusBadge from "./AdminStatusBadge";

export default function QuizzesManagement() {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const quizzes = adminQuizzes.filter((quiz) => quiz.title.toLowerCase().includes(search.toLowerCase()) && (!course || quiz.course === course));

  return <>
    <AdminPageHeader eyebrow="Quiz Management" title="Quizzes" description="Create and manage checkpoint quizzes."><Link href="/admin/quizzes/new" className="admin-button admin-button-primary"><Plus size={17} />New Quiz</Link></AdminPageHeader>
    <AdminFilters label="Search quizzes..." search={search} onSearch={setSearch}><AdminCourseFilter value={course} onChange={setCourse} /></AdminFilters>
    <AdminTable label="Quizzes" columns={["Quiz", "Course", "Module", "Questions", "Pass Score", "Attempts", "Status", "Actions"]} empty={!quizzes.length}>
      {quizzes.map((quiz) => <tr key={quiz.id}><th scope="row">{quiz.title}</th><td>{quiz.course}</td><td>{quiz.module}</td><td>{quiz.questions}</td><td>{quiz.passScore}%</td><td>{quiz.attempts}</td><td><AdminStatusBadge status={quiz.status} /></td><td><button className="admin-button" type="button" disabled aria-label={`Edit ${quiz.title}`}>Edit</button></td></tr>)}
    </AdminTable>
  </>;
}
