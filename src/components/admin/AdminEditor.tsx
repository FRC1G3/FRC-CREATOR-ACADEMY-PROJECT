"use client";
import { useState, useRef, type ReactNode, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mutateAdmin } from "@/actions/admin";
import type { AdminCommand, AdminResult } from "@/lib/admin-validation";
export default function AdminEditor({ entity, id, children, cancel, prepare, onSaved, className = "app-card admin-editor" }: { entity: AdminCommand["entity"]; id?: string; children: ReactNode; cancel?: string; prepare?: (form: FormData) => Record<string, unknown>; onSaved?: () => void; className?: string }) {
  const [result,setResult] = useState<AdminResult>({}), [pending,setPending] = useState(false);
  const router = useRouter();
  const saving = useRef(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving.current) return;
    saving.current = true;
    const form = new FormData(event.currentTarget);
    setPending(true); setResult({});
    try { const response = await mutateAdmin({ entity, operation:"save", id, data:prepare ? prepare(form) : Object.fromEntries(form) }); setResult(response); if (!response.error) { onSaved?.(); if(response.url) router.push(response.url); router.refresh(); } }
    catch { setResult({ error:"Unable to save. Check your connection or sign in again." }); }
    finally { saving.current = false; setPending(false); }
  }
  return <form className={className} onSubmit={save}>{children}<div className="admin-form-footer"><p role={result.error ? "alert" : "status"}>{result.error ?? result.success ?? "Changes are saved to the academy database."}</p><div>{cancel && <Link className="admin-button" href={cancel}>Cancel</Link>}<button className="admin-button admin-button-primary" type="submit" disabled={pending}>{pending ? "Saving..." : "Save Changes"}</button></div></div></form>;
}
export function AdminCommandButton({ entity, id, operation = "delete", label = "Delete" }: { entity: AdminCommand["entity"]; id:string; operation?:AdminCommand["operation"]; label?:string }) {
  const [pending,setPending] = useState(false), [error,setError] = useState(""); const router=useRouter(); const saving=useRef(false);
  return <span><button type="button" className="admin-button" disabled={pending} onClick={async()=>{ if(saving.current)return; if(operation === "delete" && !window.confirm("Delete this record? Records with learning history are protected.")) return; saving.current=true; setPending(true);setError("");try {const result=await mutateAdmin({entity,id,operation});if(result.error)setError(result.error);else router.refresh();}catch{setError("Unable to save. Please sign in again or retry.");}finally{saving.current=false;setPending(false);}}}>{pending ? "Saving..." : label}</button>{error && <small role="alert">{error}</small>}</span>;
}
