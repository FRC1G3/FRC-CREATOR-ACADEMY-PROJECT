"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { adminQuizzes } from "@/services/admin-queries";
import { AdminCommandButton } from "./AdminEditor";
import AdminPageHeader from "./AdminPageHeader";
import AdminFilters, { AdminCourseFilter } from "./AdminFilters";
import AdminTable from "./AdminTable";
import AdminStatusBadge from "./AdminStatusBadge";

export default function QuizzesManagement({ rows }: { rows: Awaited<ReturnType<typeof adminQuizzes>> }) {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const quizzes = rows.filter((quiz) => quiz.title.toLowerCase().includes(search.toLowerCase()) && (!course || quiz.course === course));

  return <>
    <AdminPageHeader eyebrow="Quiz Management" title="Quizzes" description="Create and manage checkpoint quizzes."><Link href="/admin/quizzes/new" className="admin-button admin-button-primary"><Plus size={17} />New Quiz</Link></AdminPageHeader>
    <AdminFilters label="Search quizzes..." search={search} onSearch={setSearch}><AdminCourseFilter value={course} onChange={setCourse} courses={[...new Set(rows.flatMap(row => [row.course]))]} /></AdminFilters>
    <AdminTable label="Quizzes" columns={["Quiz", "Course", "Module", "Questions", "Pass Score", "Attempts", "Status", "Actions"]} empty={!quizzes.length}>
      {quizzes.map((quiz) => <tr key={quiz.id}><th scope="row">{quiz.title}</th><td>{quiz.course}</td><td>{quiz.module}</td><td>{quiz.questions}</td><td>{quiz.passScore}%</td><td>{quiz.attempts}</td><td><AdminStatusBadge status={quiz.status} /></td><td><Link className="admin-button" href={"/admin/quizzes/"+quiz.id+"/edit"}>Edit</Link><AdminCommandButton entity="quiz" id={quiz.id} /></td></tr>)}
    </AdminTable>
  </>;
}
