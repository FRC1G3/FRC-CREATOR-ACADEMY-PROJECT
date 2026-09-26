import Image from "next/image";
import { Bell, Search } from "lucide-react";
import AdminStats from "@/components/admin/AdminStats";
import QuickActions from "@/components/admin/QuickActions";
import RecentCourses from "@/components/admin/RecentCourses";
import RecentActivity from "@/components/admin/RecentActivity";
import TopCourses from "@/components/admin/TopCourses";

export default function AdminPage() {
  return (
    <>
        <header className="admin-header">
          <div className="admin-toolbar">
            <label className="admin-search"><Search size={18} aria-hidden="true" /><input type="search" placeholder="Search courses, students..." aria-label="Search courses and students" /></label>
            <button className="admin-notifications" type="button" aria-label="Notifications" aria-disabled="true"><Bell size={21} /><span /></button>
            <Image className="admin-avatar" src="/images/profiles/harun.jpg" alt="Samir Mammadov, admin" width={38} height={38} />
          </div>
          <p className="section-eyebrow">Admin Dashboard</p>
          <h1>Manage Your Academy</h1>
          <p className="admin-description">Create courses, manage content and track student progress.</p>
        </header>
        <AdminStats />
        <div className="admin-grid">
          <div className="admin-main-column"><QuickActions /><RecentCourses /></div>
          <div className="admin-right-column"><RecentActivity /><TopCourses /></div>
        </div>
    </>
  );
}
