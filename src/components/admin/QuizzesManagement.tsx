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
import { filterAdminQuizzes } from "@/lib/admin-quiz-filters";

export default function QuizzesManagement({ rows, courses }: { rows: Awaited<ReturnType<typeof adminQuizzes>>; courses: {id:string;title:string}[] }) {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const quizzes = filterAdminQuizzes(rows, search, course);

  return <>
    <AdminPageHeader eyebrow="Quiz Management" title="Quizzes" description="Create and manage checkpoint quizzes."><Link href="/admin/quizzes/new" className="admin-button admin-button-primary"><Plus size={17} />New Quiz</Link></AdminPageHeader>
    <AdminFilters label="Search quizzes..." search={search} onSearch={setSearch}><AdminCourseFilter value={course} onChange={setCourse} courses={courses} /></AdminFilters>
    <AdminTable label="Quizzes" columns={["Quiz", "Course", "Module", "Questions", "Pass Score", "Attempts", "Status", "Actions"]} empty={!quizzes.length}>
      {quizzes.map((quiz) => <tr key={quiz.id}><th scope="row">{quiz.title}</th><td>{quiz.course}</td><td>{quiz.module}</td><td>{quiz.questions}</td><td>{quiz.passScore}%</td><td>{quiz.attempts}</td><td><AdminStatusBadge status={quiz.status} /></td><td><div className="admin-row-actions"><Link className="admin-button" href={"/admin/quizzes/"+quiz.id+"/edit"}>Edit</Link><AdminCommandButton entity="quiz" id={quiz.id} operation={quiz.status === "Published" ? "unpublish" : "publish"} label={quiz.status === "Published" ? "Unpublish" : "Publish"} /><AdminCommandButton entity="quiz" id={quiz.id} /></div></td></tr>)}
    </AdminTable>
  </>;
}
