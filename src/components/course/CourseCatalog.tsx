"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import CourseCard from "./CourseCard";
import { filterCourses } from "@/lib/course-filter";
import type { CourseCardView } from "@/types/learning";

export default function CourseCatalog({ courses }: { courses: CourseCardView[] }) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("ALL");
  const filtered = filterCourses(courses, search, level);
  return <>
    <div className="courses-toolbar">
      <label className="courses-search"><Search size={21} aria-hidden="true" /><input type="search" placeholder="Search courses..." aria-label="Search courses" value={search} onChange={event => setSearch(event.target.value)} /></label>
      <div className="courses-filters" role="group" aria-label="Course level">
        {["All", "Beginner", "Intermediate", "Advanced"].map(label => <button key={label} type="button" className={level === label.toUpperCase() ? "active" : undefined} aria-pressed={level === label.toUpperCase()} onClick={() => setLevel(label.toUpperCase())}>{label}</button>)}
      </div>
    </div>
    <section className="courses-grid" aria-label="Published courses">
      {filtered.map(course => <CourseCard key={course.id} course={course} />)}
      {filtered.length === 0 && <p className="app-card" role="status">{courses.length ? "No courses match your search." : "No published courses yet."}</p>}
    </section>
  </>;
}
