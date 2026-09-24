import "@/styles/courses/courses.css";
import { Search } from "lucide-react";
import CourseCard from "@/components/course/CourseCard";
import { courses } from "@/data/mock-data";

export default function CoursesPage() {
  return (
    <main className="courses-page">
      <div className="courses-container">
        <header className="courses-heading">
          <span>COURSES</span>
          <h1>Explore Courses</h1>
          <p>Practical lessons to help you create, grow and succeed.</p>
        </header>
        <div className="courses-toolbar">
          <label className="courses-search">
            <Search size={21} aria-hidden="true" />
            <input type="search" readOnly placeholder="Search courses..." aria-label="Search courses" />
          </label>
          <div className="courses-filters" role="group" aria-label="Course level">
            <button className="active" type="button" disabled aria-pressed="true">All</button>
            <button type="button" disabled aria-pressed="false">Beginner</button>
            <button type="button" disabled aria-pressed="false">Intermediate</button>
            <button type="button" disabled aria-pressed="false">Advanced</button>
          </div>
        </div>
        <section className="courses-grid" aria-label="Available and upcoming courses">
          {courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </section>
        <section className="courses-banner app-card">
          <div><h2>Same You.<br />A More Creative You.</h2><span /></div>
          <p>DISCIPLINE<br />CREATES<br />FREEDOM</p>
        </section>
      </div>
    </main>
  );
}
