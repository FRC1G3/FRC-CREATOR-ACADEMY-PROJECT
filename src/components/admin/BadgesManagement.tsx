"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { adminBadges } from "@/data/admin-data";
import AdminPageHeader from "./AdminPageHeader";
import AdminStatusBadge from "./AdminStatusBadge";
import AdminFormField from "./AdminFormField";

export default function BadgesManagement() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [badge, setBadge] = useState<(typeof adminBadges)[number] | null>(null);
  function openBadge(value: (typeof adminBadges)[number] | null) {
    setBadge(value);
    dialog.current?.showModal();
  }

  return <>
    <AdminPageHeader eyebrow="Badge Management" title="Badges" description="Create and manage creator achievements."><button className="admin-button admin-button-primary" type="button" onClick={() => openBadge(null)}><Plus size={17} />New Badge</button></AdminPageHeader>
    <div className="admin-badge-grid">{adminBadges.map((item) => <article className="app-card admin-badge-card" key={item.id}>
      <span className="admin-icon admin-tone-red"><item.icon size={28} aria-hidden="true" /></span><h2>{item.title}</h2><p>{item.condition}</p><div><AdminStatusBadge status={item.status} /><button className="admin-button" type="button" onClick={() => openBadge(item)} aria-label={`Edit ${item.title}`}>Edit</button></div>
    </article>)}</div>
    <dialog ref={dialog} className="admin-dialog" aria-labelledby="admin-badge-dialog-title">
      <div className="admin-panel-heading"><h2 id="admin-badge-dialog-title">{badge ? "Edit Badge" : "Create Badge"}</h2><button className="admin-button" type="button" aria-label="Close badge form" onClick={() => dialog.current?.close()}><X size={18} /></button></div>
      <form key={badge?.id ?? "new"} className="admin-badge-form" onSubmit={(event) => event.preventDefault()}>
        <AdminFormField label="Badge Name"><input defaultValue={badge?.title} placeholder="Name your badge" /></AdminFormField>
        <AdminFormField label="Description"><textarea rows={3} defaultValue={badge?.condition} placeholder="What does this achievement celebrate?" /></AdminFormField>
        <AdminFormField label="Condition"><input defaultValue={badge?.condition} placeholder="e.g. Complete your first lesson" /></AdminFormField>
        <AdminFormField label="Icon"><select><option>Trophy</option><option>Play</option><option>Growth</option></select></AdminFormField>
        <AdminFormField label="Status"><select defaultValue={badge?.status ?? "Draft"}><option>Draft</option><option>Published</option></select></AdminFormField>
        <p className="admin-form-note">UI preview only. Changes are not saved.</p>
        <div className="admin-dialog-actions"><button className="admin-button" type="button" onClick={() => dialog.current?.close()}>Cancel</button><button className="admin-button admin-button-primary" type="button" disabled>Save Badge</button></div>
      </form>
    </dialog>
  </>;
}
