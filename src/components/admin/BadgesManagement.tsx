"use client";
import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import AdminBadgeIcon from "./AdminBadgeIcon";
import type { BadgeEdit } from "@/types/admin";
import { conditions } from "@/lib/admin-validation";
import AdminPageHeader from "./AdminPageHeader";
import AdminStatusBadge from "./AdminStatusBadge";
import AdminFormField from "./AdminFormField";
import AdminEditor, { AdminCommandButton } from "./AdminEditor";
export default function BadgesManagement({badges}:{badges:BadgeEdit[]}) {
  const dialog=useRef<HTMLDialogElement>(null), [badge,setBadge]=useState<BadgeEdit|null>(null);
  const [formVersion,setFormVersion]=useState(0);
  function openBadge(value:BadgeEdit|null){setBadge(value);setFormVersion(v=>v+1);dialog.current?.showModal();}
  return <><AdminPageHeader eyebrow="Badge Management" title="Badges" description="Create and manage creator achievements."><button className="admin-button admin-button-primary" type="button" onClick={()=>openBadge(null)}><Plus size={17} />New Badge</button></AdminPageHeader>
  {!badges.length && <p className="admin-empty">No badges yet.</p>}
  <div className="admin-badge-grid">{badges.map(item=><article className="app-card admin-badge-card" key={item.id}><span className="admin-icon admin-tone-red"><AdminBadgeIcon icon={item.icon} /></span><h2>{item.name}</h2><p>{item.description}</p><div><AdminStatusBadge status={item.status==='ACTIVE'?'Active':'Inactive'} /><button className="admin-button" onClick={()=>openBadge(item)}>Edit</button><AdminCommandButton entity="badge" id={item.id} /></div></article>)}</div>
  <dialog ref={dialog} className="admin-dialog" aria-labelledby="admin-badge-dialog-title"><div className="admin-panel-heading"><h2 id="admin-badge-dialog-title">{badge?'Edit Badge':'Create Badge'}</h2><button className="admin-button" type="button" aria-label="Close badge form" onClick={()=>dialog.current?.close()}><X size={18} /></button></div>
  <AdminEditor key={formVersion} entity="badge" id={badge?.id} className="admin-badge-form" onSaved={()=>dialog.current?.close()}>
    <AdminFormField label="Badge Name"><input name="name" required defaultValue={badge?.name} /></AdminFormField>
    <AdminFormField label="Slug"><input name="slug" defaultValue={badge?.slug} /></AdminFormField>
    <AdminFormField label="Description"><textarea name="description" rows={3} defaultValue={badge?.description} /></AdminFormField>
    <AdminFormField label="Condition"><select name="conditionType" defaultValue={badge?.conditionType ?? 'FIRST_SECTION_COMPLETE'}>{conditions.map(c=><option key={c}>{c}</option>)}</select></AdminFormField>
    <AdminFormField label="Required count"><input name="conditionValue" type="number" min={1} defaultValue={badge?.conditionValue ?? 1} /></AdminFormField>
    <AdminFormField label="Icon"><select name="icon" defaultValue={badge?.icon.toLowerCase() ?? 'trophy'}>{['play','star','flame','trophy','crown'].map(i=><option key={i}>{i}</option>)}</select></AdminFormField>
    <AdminFormField label="Status"><select name="status" defaultValue={badge?.status ?? 'ACTIVE'}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></AdminFormField>
  </AdminEditor></dialog></>;
}
