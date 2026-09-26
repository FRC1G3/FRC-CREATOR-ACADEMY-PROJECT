import { requireAdmin } from "@/lib/current-user";
import AdminSidebar from "@/components/admin/AdminSidebar";
import "@/styles/admin/admin.css";
import "@/styles/admin/admin-forms.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <main className="admin-page">
      <AdminSidebar />
      <div className="admin-content">{children}</div>
    </main>
  );
}
