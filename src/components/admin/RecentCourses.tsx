import DatabaseImage from "@/components/learning/DatabaseImage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { adminCourses } from "@/services/admin-queries";

export default function RecentCourses({courses:recentAdminCourses}:{courses:Awaited<ReturnType<typeof adminCourses>>}) {
  return (
    <section className="app-card admin-panel">
      <div className="admin-panel-heading"><div><h2>Recent Courses</h2><p>Your latest courses and their status.</p></div><Link className="admin-text-button" href="/admin/courses">View All Courses<ArrowRight size={14} /></Link></div>
      <div className="admin-table-wrap" role="region" aria-label="Recent courses" tabIndex={0}>
        <table className="admin-table">
          <thead><tr>{["#", "Course", "Lessons", "Students", "Status", "Last Updated", "Actions"].map((title) => <th scope="col" key={title}>{title}</th>)}</tr></thead>
          <tbody>{!recentAdminCourses.length && <tr><td colSpan={7}>No courses yet.</td></tr>}{recentAdminCourses.map((course, index) => (
            <tr key={course.id}>
              <td>{index+1}</td>
              <th scope="row"><div className="admin-course-name"><DatabaseImage src={course.image} alt="" width={56} height={42} /><div><strong>{course.title}</strong><small>{course.description}</small></div></div></th>
              <td>{course.lessons}</td><td>{course.students}</td>
              <td><span className={`admin-status ${course.status === "Published" ? "is-published" : "is-draft"}`}>{course.status}</span></td>
              <td>{course.updated}</td>
              <td><div className="admin-row-actions"><Link className="admin-button" href={`/admin/courses/${course.id}/edit`} aria-label={`Edit ${course.title}`}>Edit</Link></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}
