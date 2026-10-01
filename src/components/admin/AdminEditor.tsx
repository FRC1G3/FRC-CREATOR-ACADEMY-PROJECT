"use client";
import { createContext, useState, useRef, type ReactNode, type FormEvent, type Dispatch, type SetStateAction } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import Link from "next/link";
import { mutateAdmin } from "@/actions/admin";
import type { AdminCommand, AdminResult } from "@/lib/admin-validation";
import { notifyStatus } from "@/components/learning/StatusToast";
export const AdminImageProcessing = createContext<Dispatch<SetStateAction<number>>>(() => {});
export const AdminFormAvailability = createContext<Dispatch<SetStateAction<boolean>>>(() => {});
export default function AdminEditor({ entity, id, children, cancel, prepare, onSaved, className = "app-card admin-editor" }: { entity: AdminCommand["entity"]; id?: string; children: ReactNode; cancel?: string; prepare?: (form: FormData) => Record<string, unknown>; onSaved?: () => void; className?: string }) {
  const [result,setResult] = useState<AdminResult>({}), [pending,setPending] = useState(false);
  const router = useRouter();
  const saving = useRef(false);
  const [processing, setProcessing] = useState(0);
  const [available, setAvailable] = useState(true);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving.current || processing || !available) return;
    saving.current = true;
    const form = new FormData(event.currentTarget);
    setPending(true); setResult({});
    try { const response = await mutateAdmin({ entity, operation:"save", id, data:prepare ? prepare(form) : Object.fromEntries(form) }); setResult(response); if (!response.error) { if (response.success) notifyStatus(response.success); onSaved?.(); if(response.url) router.push(response.url);  } }
    catch (error) { unstable_rethrow(error); setResult({ error:"Unable to save. Check your connection or sign in again." }); }
    finally { saving.current = false; setPending(false); }
  }
  return <AdminFormAvailability.Provider value={setAvailable}><AdminImageProcessing.Provider value={setProcessing}><form className={className} onSubmit={save}><fieldset className="admin-editor-fields" disabled={pending}>{children}</fieldset><div className="admin-form-footer"><p role={result.error ? "alert" : "status"}>{result.error ?? result.success ?? "Save changes to update the academy."}</p><div>{cancel && <Link className="admin-button" href={cancel}>Cancel</Link>}<button className="admin-button admin-button-primary" type="submit" disabled={pending || processing > 0 || !available}>{pending ? "Saving..." : processing ? "Preparing image..." : "Save Changes"}</button></div></div></form></AdminImageProcessing.Provider></AdminFormAvailability.Provider>;
}
export function AdminCommandButton({ entity, id, operation = "delete", label = "Delete" }: { entity: AdminCommand["entity"]; id:string; operation?:AdminCommand["operation"]; label?:string }) {
  const [pending,setPending] = useState(false); const saving=useRef(false);
  return <span><button type="button" className="admin-button" disabled={pending} aria-busy={pending} onClick={async()=>{ if(saving.current)return; if(operation === "delete" && !window.confirm("Delete this record? Records with learning history are protected.")) return; saving.current=true; setPending(true);try {const result=await mutateAdmin({entity,id,operation});notifyStatus(result.error ?? (operation === "delete" ? "Deleted successfully." : result.success ?? "Changes saved."));}catch(error){unstable_rethrow(error);notifyStatus("Unable to save. Please sign in again or retry.");}finally{saving.current=false;setPending(false);}}}>{pending ? "Saving..." : label}</button></span>;
}
