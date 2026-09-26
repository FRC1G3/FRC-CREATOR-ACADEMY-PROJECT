import Image from "next/image";
import Link from "next/link";
import { ArrowRight, EllipsisVertical } from "lucide-react";
import { recentAdminCourses } from "@/data/admin-data";

export default function RecentCourses() {
  return (
    <section className="app-card admin-panel">
      <div className="admin-panel-heading"><div><h2>Recent Courses</h2><p>Your latest courses and their status.</p></div><Link className="admin-text-button" href="/admin/courses">View All Courses<ArrowRight size={14} /></Link></div>
      <div className="admin-table-wrap" role="region" aria-label="Recent courses" tabIndex={0}>
        <table className="admin-table">
          <thead><tr>{["#", "Course", "Lessons", "Students", "Status", "Last Updated", "Actions"].map((title) => <th scope="col" key={title}>{title}</th>)}</tr></thead>
          <tbody>{recentAdminCourses.map((course) => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <th scope="row"><div className="admin-course-name"><Image src={course.image} alt="" width={56} height={42} /><div><strong>{course.title}</strong><small>{course.description}</small></div></div></th>
              <td>{course.lessons}</td><td>{course.students}</td>
              <td><span className={`admin-status ${course.status === "Published" ? "is-published" : "is-draft"}`}>{course.status}</span></td>
              <td>{course.updated}</td>
              <td><div className="admin-row-actions"><Link className="admin-button" href={`/admin/courses/${course.id}/edit`} aria-label={`Edit ${course.title}`}>Edit</Link><button type="button" aria-disabled="true" aria-label={`More actions for ${course.title}`}><EllipsisVertical size={17} /></button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}
