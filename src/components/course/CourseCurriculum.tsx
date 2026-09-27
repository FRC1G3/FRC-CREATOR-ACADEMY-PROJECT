"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import CourseModule from "./CourseModule";
import { toggleModule, toggleAllModules } from "@/lib/accordion";
import type { ModuleView } from "@/types/learning";

export default function CourseCurriculum({ modules }: { modules: ModuleView[] }) {
  const [open, setOpen] = useState(() => modules.filter(module => module.lessons.some(lesson => lesson.status === "current")).map(module => module.number));
  const numbers = modules.map(module => module.number);
  const allOpen = numbers.length > 0 && numbers.every(number => open.includes(number));
  return <section className="course-curriculum" aria-labelledby="course-content-title">
    <div className="course-curriculum-heading">
      <h2 id="course-content-title">Course Content</h2>
      <button type="button" disabled={!numbers.length} onClick={() => setOpen(value => toggleAllModules(value, numbers))}>{allOpen ? "Collapse All" : "Expand All"}{allOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
    </div>
    <div className="course-module-list">{modules.map(module => <CourseModule key={module.number} module={module} isExpanded={open.includes(module.number)} onToggle={() => setOpen(value => toggleModule(value, module.number))} />)}</div>
  </section>;
}
