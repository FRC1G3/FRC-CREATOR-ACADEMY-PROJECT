import type { Module } from "@/generated/prisma/client";
import AdminEditor, { AdminCommandButton } from "./AdminEditor";
import AdminFormField from "./AdminFormField";
export default function ModulesManagement({ courseId, modules }: { courseId:string; modules:Module[] }) {
  return <section className="admin-question-list"><h2>Modules</h2>{[...modules, null].map(m=><div key={m?.id ?? "new"}><AdminEditor entity="module" id={m?.id}>
    <h3>{m ? "Edit Module" : "New Module"}</h3><input type="hidden" name="courseId" value={courseId} />
    <div className="admin-form-grid"><AdminFormField label="Title"><input name="title" required defaultValue={m?.title} /></AdminFormField><AdminFormField label="Order"><input name="order" type="number" min={1} defaultValue={m?.order ?? (modules.at(-1)?.order ?? 0)+1} /></AdminFormField><AdminFormField label="Description"><textarea name="description" defaultValue={m?.description ?? ""} /></AdminFormField></div>
    </AdminEditor>{m && <AdminCommandButton entity="module" id={m.id} />}</div>)}</section>;
}
