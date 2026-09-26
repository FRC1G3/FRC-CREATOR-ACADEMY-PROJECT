import AdminSidebar from "@/components/admin/AdminSidebar";
import "@/styles/admin/admin.css";
import "@/styles/admin/admin-forms.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="admin-page">
      <AdminSidebar />
      <div className="admin-content">{children}</div>
    </main>
  );
}
