"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, Trophy, ClipboardCheck } from "lucide-react";
import type { RoadmapNode } from "@/generated/prisma/client";
import { availableRoadmapTargets, roadmapEmptyMessage, type RoadmapTargetType } from "@/lib/admin-roadmap";
import AdminPageHeader from "./AdminPageHeader";
import AdminEditor, { AdminCommandButton } from "./AdminEditor";
import AdminFormField from "./AdminFormField";
type Target={id:string;title:string};
type PathCourse=Target & {roadmapNodes:RoadmapNode[];lessons:Target[];quizzes:Target[]};

export default function RoadmapManagement({courses,badges}:{courses:PathCourse[];badges:Target[]}){
 const [courseId,setCourse]=useState(courses[0]?.id ?? ''),[type,setType]=useState<RoadmapTargetType>('LESSON'),[editing,setEditing]=useState<string|null>(null);
 const course=courses.find(c=>c.id===courseId);
 const targets=availableRoadmapTargets(type,course,badges);
 const eligibleCount=type==='LESSON'?(course?.lessons.length ?? 0):type==='QUIZ'?(course?.quizzes.length ?? 0):badges.length;
 const createHref=type==='LESSON'?'/admin/lessons/new':type==='QUIZ'?'/admin/quizzes/new':'/admin/badges';
 return <><AdminPageHeader eyebrow="Roadmap Management" title="Learning Roadmap" description="Manage the order and unlock structure of your learning path." />
 {!courses.length ? <div className="app-card admin-empty"><h2>No courses yet</h2><p>Create a course before building a roadmap.</p><Link className="admin-button" href="/admin/courses/new">Create Course</Link></div> : <>
 <div className="admin-filters"><label className="admin-inline-label">Course<select className="admin-select" value={courseId} onChange={e=>{setCourse(e.target.value);setEditing(null);}}>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
 {!course?.roadmapNodes.length && <div className="app-card admin-empty"><h2>No roadmap nodes yet</h2><p>Add the first eligible item below.</p></div>}
 <ol className="admin-roadmap-list">{course?.roadmapNodes.map((n,i)=>{const Icon=n.type==='LESSON'?BookOpen:n.type==='QUIZ'?ClipboardCheck:Trophy;return <li className="app-card admin-roadmap-row" key={n.id}><span className="admin-node-order">{n.order}</span><Icon size={22}/><div className="admin-node-copy"><small>{n.type}</small>{editing===n.id?<AdminEditor entity="node" id={n.id} className="admin-node-edit" onSaved={()=>setEditing(null)}><AdminFormField label="Node title"><input name="title" required maxLength={200} defaultValue={n.title}/></AdminFormField></AdminEditor>:<><h2>{n.title}</h2><p>Target and type are locked to preserve learning-path meaning.</p></>}</div><div className="admin-node-actions"><button className="admin-button" type="button" onClick={()=>setEditing(editing===n.id?null:n.id)}>{editing===n.id?'Cancel edit':'Edit title'}</button>{i>0 && <AdminCommandButton entity="node" id={n.id} operation="up" label="Move up" />}{i<course.roadmapNodes.length-1 && <AdminCommandButton entity="node" id={n.id} operation="down" label="Move down" />}<AdminCommandButton entity="node" id={n.id} label="Remove" /></div></li>})}</ol>
 {course && <section className="app-card admin-roadmap-add"><h2>Add Node</h2><div className="admin-form-grid"><AdminFormField label="Type"><select value={type} onChange={e=>setType(e.target.value as RoadmapTargetType)}><option>LESSON</option><option>QUIZ</option><option>REWARD</option></select></AdminFormField></div>{targets.length?<AdminEditor key={courseId+type} entity="node"><input type="hidden" name="courseId" value={courseId}/><input type="hidden" name="type" value={type}/><div className="admin-form-grid"><AdminFormField label="Title"><input name="title" required /></AdminFormField><AdminFormField label="Target"><select name="targetId" required defaultValue={targets[0]?.id}>{targets.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></AdminFormField></div></AdminEditor>:<div className="admin-empty admin-target-empty"><p>{roadmapEmptyMessage(type,eligibleCount>0)}</p>{!eligibleCount&&<Link className="admin-button" href={createHref}>{type==='LESSON'?'Create Lesson':type==='QUIZ'?'Create Quiz':'Manage Badges'}</Link>}</div>}</section>}
 </>}</>;
}
