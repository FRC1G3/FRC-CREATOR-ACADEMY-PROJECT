import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { topAdminCourses } from "@/data/admin-data";

export default function TopCourses() {
  return (
    <section className="app-card admin-panel">
      <div className="admin-panel-heading"><h2>Top Performing Courses</h2><Link className="admin-text-button" href="/admin/courses">View All<ArrowRight size={14} /></Link></div>
      <div className="admin-top-courses">{topAdminCourses.map((course) => (
        <div className="admin-top-course" key={course.id}>
          <Image src={course.image} alt="" width={70} height={52} />
          <div><h3>{course.title}</h3><p><span>{course.students} students</span><strong>{course.performance}%</strong></p><progress max={100} value={course.performance} aria-label={`${course.title} performance`} /></div>
        </div>
      ))}</div>
    </section>
  );
}
