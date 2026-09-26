import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { adminCourses } from "@/data/admin-data";

export default function AdminFilters({ label, search, onSearch, children }: {
  label: string; search: string; onSearch: (value: string) => void; children?: ReactNode;
}) {
  return <div className="admin-filters"><label className="admin-search"><Search size={18} aria-hidden="true" /><input type="search" aria-label={label} placeholder={label} value={search} onChange={(event) => onSearch(event.target.value)} /></label>{children}</div>;
}

export function AdminCourseFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <select className="admin-select" aria-label="Filter by course" value={value} onChange={(event) => onChange(event.target.value)}><option value="">All courses</option>{adminCourses.map((course) => <option key={course.id}>{course.title}</option>)}</select>;
}
