"use client";

import { useState } from "react";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { adminRoadmap, adminCourses } from "@/data/admin-data";
import AdminPageHeader from "./AdminPageHeader";
import AdminStatusBadge from "./AdminStatusBadge";

export default function RoadmapManagement() {
  const [course, setCourse] = useState(adminCourses[0].title);
  return <>
    <AdminPageHeader eyebrow="Roadmap Management" title="Learning Roadmap" description="Manage the order and unlock structure of your learning path."><button className="admin-button admin-button-primary" type="button" disabled><Plus size={17} />Add Node</button></AdminPageHeader>
    <div className="admin-filters"><label className="admin-inline-label">Course<select className="admin-select" value={course} onChange={(event) => setCourse(event.target.value)}>{adminCourses.map((item) => <option key={item.id}>{item.title}</option>)}</select></label></div>
    {course !== adminCourses[0].title ? <div className="app-card admin-empty"><h2>No roadmap nodes yet</h2><p>This course has no learning path in the preview.</p></div> : <ol className="admin-roadmap-list">
      {adminRoadmap.map(({ id, title, type, status, unlock, icon: Icon }) => <li className="app-card admin-roadmap-row" key={id}>
        <span className="admin-node-order">{id}</span><Icon size={22} aria-hidden="true" />
        <div className="admin-node-copy"><small>{type}</small><h2>{title}</h2><p>{unlock}</p></div><AdminStatusBadge status={status} />
        <div className="admin-node-actions"><button type="button" className="admin-button" disabled aria-label={`Edit ${title}`}>Edit</button><button type="button" className="admin-button" disabled aria-label={`Move ${title} up`}><ArrowUp size={16} /></button><button type="button" className="admin-button" disabled aria-label={`Move ${title} down`}><ArrowDown size={16} /></button></div>
      </li>)}
    </ol>}
  </>;
}
