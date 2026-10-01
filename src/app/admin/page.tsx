import { timed } from "@/lib/performance";
import DatabaseImage from "@/components/learning/DatabaseImage";
import { Search } from "lucide-react";
import AdminStats from "@/components/admin/AdminStats";
import QuickActions from "@/components/admin/QuickActions";
import RecentCourses from "@/components/admin/RecentCourses";
import RecentActivity from "@/components/admin/RecentActivity";
import TopCourses from "@/components/admin/TopCourses";

import { requireAdmin } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import { adminCourses } from "@/services/admin-queries";
async function AdminPage() {
  const user=await requireAdmin(),db=getPrisma();
  const [courses,lessons,students,attemptGroups,completionGroups]=await Promise.all([adminCourses(),db.lesson.count(),db.user.count({where:{role:'STUDENT'}}),db.quizAttempt.groupBy({by:['passed'],where:{completedAt:{not:null}},_count:{_all:true}}),db.enrollment.groupBy({by:['courseId'],where:{completedAt:{not:null}},_count:{_all:true}})]);
  const attempts=attemptGroups.reduce((n,g)=>n+g._count._all,0),passed=attemptGroups.find(g=>g.passed===true)?._count._all ?? 0;
  const completions=new Map(completionGroups.map(g=>[g.courseId,g._count._all]));
  const top=[...courses].sort((a,b)=>b.students-a.students).slice(0,3).map(c=>({id:c.id,title:c.title,image:c.image,students:c.students,performance:c.students?Math.round((completions.get(c.id) ?? 0)/c.students*100):0}));
  return (
    <>
        <header className="admin-header">
          <div className="admin-toolbar">
            <form action="/admin/courses"><label className="admin-search"><Search size={18} aria-hidden="true" /><input name="q" type="search" placeholder="Search courses..." aria-label="Search courses" /></label></form>
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

export default async function ProfiledPage(...args: Parameters<typeof AdminPage>) {
  return timed("route.admin", () => AdminPage(...args));
}
