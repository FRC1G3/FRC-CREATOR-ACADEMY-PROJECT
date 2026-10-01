"use client";
import { useState, useContext, useEffect } from "react";
import { AdminFormAvailability } from "./AdminEditor";
import type { Catalog } from "@/types/admin";
import AdminFormField from "./AdminFormField";
export default function CourseModuleFields({ catalog, courseId, moduleId, optional = false, fixed = false }: { catalog:Catalog; courseId?:string; moduleId?:string | null; optional?:boolean; fixed?:boolean }) {
  const [selected,setSelected] = useState(courseId ?? catalog[0]?.id ?? "");
  const modules = catalog.find(c => c.id === selected)?.modules ?? [];
  const setAvailable = useContext(AdminFormAvailability);
  const available = Boolean(selected) && (optional || modules.length > 0);
  useEffect(() => { setAvailable(available); }, [available, setAvailable]);
  return <><AdminFormField label="Course"><select name="courseId" value={selected} disabled={fixed} required title={fixed ? "Existing content stays in its course." : undefined} onChange={e=>setSelected(e.target.value)}>{!catalog.length && <option value="">Create a course first</option>}{catalog.filter(c => !fixed || c.id === courseId).map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></AdminFormField><AdminFormField label="Module"><select key={selected} name="moduleId" disabled={fixed} required={!optional} title={fixed ? "Existing content stays in its module." : undefined} defaultValue={moduleId ?? (optional ? "" : modules[0]?.id ?? "")}>{!optional && !modules.length && <option value="">Add a module first</option>}{optional && (!fixed || !moduleId) && <option value="">Course checkpoint</option>}{modules.filter(m => !fixed || m.id === moduleId).map(m=><option key={m.id} value={m.id}>{m.order}. {m.title}</option>)}</select></AdminFormField>{fixed && <><input type="hidden" name="courseId" value={courseId ?? ""} /><input type="hidden" name="moduleId" value={moduleId ?? ""} /></>}{!catalog.length && <p role="status">Create a course first.</p>}{!optional && !modules.length && <p role="status">Add a module in Course Edit before creating a lesson.</p>}</>;
}
