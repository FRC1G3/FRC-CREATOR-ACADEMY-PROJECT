"use client";
import { useState } from "react";
import type { Catalog } from "@/types/admin";
import AdminFormField from "./AdminFormField";
export default function CourseModuleFields({ catalog, courseId, moduleId, optional = false, fixed = false }: { catalog:Catalog; courseId?:string; moduleId?:string | null; optional?:boolean; fixed?:boolean }) {
  const [selected,setSelected] = useState(courseId ?? catalog[0]?.id ?? "");
  const modules = catalog.find(c => c.id === selected)?.modules ?? [];
  return <><AdminFormField label="Course"><select name="courseId" value={selected} disabled={fixed || !catalog.length} title={fixed ? "Existing content stays in its course." : undefined} onChange={e=>setSelected(e.target.value)}>{catalog.filter(c => !fixed || c.id === courseId).map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></AdminFormField><AdminFormField label="Module"><select key={selected} name="moduleId" disabled={fixed || (!optional && !modules.length)} required={!optional} title={fixed ? "Existing content stays in its module." : undefined} defaultValue={moduleId ?? (optional ? "" : modules[0]?.id)}>{optional && (!fixed || !moduleId) && <option value="">Course checkpoint</option>}{modules.filter(m => !fixed || m.id === moduleId).map(m=><option key={m.id} value={m.id}>{m.order}. {m.title}</option>)}</select></AdminFormField>{fixed && <><input type="hidden" name="courseId" value={courseId ?? ""} /><input type="hidden" name="moduleId" value={moduleId ?? ""} /></>}{!catalog.length && <p role="status">Create a course first.</p>}{!optional && !modules.length && <p role="status">Add a module in Course Edit before creating a lesson.</p>}</>;
}
