"use client";
import { useState } from "react";
import { BookOpen, Trophy, ClipboardCheck } from "lucide-react";
import type { RoadmapNode } from "@/generated/prisma/client";
import AdminPageHeader from "./AdminPageHeader";
import AdminEditor, { AdminCommandButton } from "./AdminEditor";
import AdminFormField from "./AdminFormField";
type Target={id:string;title:string};
type PathCourse=Target & {roadmapNodes:RoadmapNode[];lessons:Target[];quizzes:Target[]};
export default function RoadmapManagement({courses,badges}:{courses:PathCourse[];badges:Target[]}){
 const [courseId,setCourse]=useState(courses[0]?.id ?? ''),[type,setType]=useState('LESSON');
 const course=courses.find(c=>c.id===courseId), targets=type==='LESSON'?course?.lessons ?? []:type==='QUIZ'?course?.quizzes ?? []:badges;
 return <><AdminPageHeader eyebrow="Roadmap Management" title="Learning Roadmap" description="Manage the order and unlock structure of your learning path." />
 <div className="admin-filters"><label className="admin-inline-label">Course<select className="admin-select" value={courseId} onChange={e=>setCourse(e.target.value)}>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
 {!course?.roadmapNodes.length && <div className="app-card admin-empty"><h2>No roadmap nodes yet</h2></div>}
 <ol className="admin-roadmap-list">{course?.roadmapNodes.map((n,i)=>{const Icon=n.type==='LESSON'?BookOpen:n.type==='QUIZ'?ClipboardCheck:Trophy;return <li className="app-card admin-roadmap-row" key={n.id}><span className="admin-node-order">{n.order}</span><Icon size={22}/><div className="admin-node-copy"><small>{n.type}</small><h2>{n.title}</h2><p>Unlocked by earlier learning steps</p></div><div className="admin-node-actions">{i>0 && <AdminCommandButton entity="node" id={n.id} operation="up" label="Move up" />}{i<course.roadmapNodes.length-1 && <AdminCommandButton entity="node" id={n.id} operation="down" label="Move down" />}<AdminCommandButton entity="node" id={n.id} label="Remove" /></div></li>})}</ol>
 {course && <AdminEditor key={courseId} entity="node"><h2>Add Node</h2><input type="hidden" name="courseId" value={courseId}/><div className="admin-form-grid"><AdminFormField label="Title"><input name="title" required /></AdminFormField><AdminFormField label="Type"><select name="type" value={type} onChange={e=>setType(e.target.value)}><option>LESSON</option><option>QUIZ</option><option>REWARD</option></select></AdminFormField><AdminFormField label="Target"><select name="targetId" key={courseId+type} required>{targets.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></AdminFormField></div></AdminEditor>}</>;
}
