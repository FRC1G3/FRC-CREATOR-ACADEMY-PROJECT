import DatabaseImage from "@/components/learning/DatabaseImage";
import { Bell, Search } from "lucide-react";
import AdminStats from "@/components/admin/AdminStats";
import QuickActions from "@/components/admin/QuickActions";
import RecentCourses from "@/components/admin/RecentCourses";
import RecentActivity from "@/components/admin/RecentActivity";
import TopCourses from "@/components/admin/TopCourses";

import { requireAdmin } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import { adminCourses } from "@/services/admin-queries";
export default async function AdminPage() {
  const user=await requireAdmin(),db=getPrisma();
  const [courses,lessons,students,attempts,passed,ranked]=await Promise.all([adminCourses(),db.lesson.count(),db.user.count({where:{role:'STUDENT'}}),db.quizAttempt.count({where:{completedAt:{not:null}}}),db.quizAttempt.count({where:{passed:true,completedAt:{not:null}}}),db.course.findMany({include:{enrollments:{select:{completedAt:true}}}})]);
  const top=ranked.sort((a,b)=>b.enrollments.length-a.enrollments.length).slice(0,3).map(c=>({id:c.id,title:c.title,image:c.thumbnailUrl || '/images/hero.png',students:c.enrollments.length,performance:c.enrollments.length?Math.round(c.enrollments.filter(e=>e.completedAt).length/c.enrollments.length*100):0}));
  return (
    <>
        <header className="admin-header">
          <div className="admin-toolbar">
            <form action="/admin/courses"><label className="admin-search"><Search size={18} aria-hidden="true" /><input name="q" type="search" placeholder="Search courses..." aria-label="Search courses" /></label></form>
            <button className="admin-notifications" type="button" aria-label="Notifications" disabled><Bell size={21} /><span /></button>
            <DatabaseImage className="admin-avatar" src={user.avatarUrl || "/images/profiles/frc.PNG"} fallback="/images/profiles/frc.PNG" alt={user.name} width={38} height={38} />
          </div>
          <p className="section-eyebrow">Admin Dashboard</p>
          <h1>Manage Your Academy</h1>
          <p className="admin-description">Create courses, manage content and track student progress.</p>
        </header>
        <AdminStats courses={courses.length} lessons={lessons} students={students} passRate={attempts?Math.round(passed/attempts*100):0} />
        <div className="admin-grid">
          <div className="admin-main-column"><QuickActions /><RecentCourses courses={courses.slice(0,5)} /></div>
          <div className="admin-right-column"><RecentActivity courses={courses.slice(0,5)} /><TopCourses courses={top} /></div>
        </div>
    </>
  );
}
