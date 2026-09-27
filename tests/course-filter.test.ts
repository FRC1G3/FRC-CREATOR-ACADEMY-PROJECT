import { expect, it } from "vitest";
import { filterCourses } from "../src/lib/course-filter";
const courses = [
  { id: "youtube", title: "YouTube", description: "Build your channel", level: "BEGINNER" },
  { id: "editing", title: "Editing", description: "YouTube production", level: "INTERMEDIATE" },
  { id: "growth", title: "Growth", description: "Channel analytics", level: "ADVANCED" },
].map(course => ({ ...course, image: null, lessons: 3, progress: null }));
it("shows every loaded published course for All", () => expect(filterCourses(courses, "", "ALL")).toEqual(courses));
it("searches titles and descriptions ignoring case and edge whitespace", () => expect(filterCourses(courses, " YOUTUBE ", "ALL").map(c => c.id)).toEqual(["youtube", "editing"]));
it.each(["BEGINNER", "INTERMEDIATE", "ADVANCED"])("filters %s", level => expect(filterCourses(courses, "", level)).toEqual(courses.filter(c => c.level === level)));
it("combines search and level", () => expect(filterCourses(courses, "youtube", "INTERMEDIATE").map(c => c.id)).toEqual(["editing"]));
it("returns an empty result for unmatched filters", () => expect(filterCourses(courses, "editing", "BEGINNER")).toEqual([]));
