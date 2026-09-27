import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { toggleModule, toggleAllModules } from "../src/lib/accordion";
import CourseModule from "../src/components/course/CourseModule";
import ModuleLessons from "../src/components/learn/ModuleLessons";
const courseModule = { number: 1, title: "Basics", lessonCount: 1, progress: 0, lessons: [{ title: "First", duration: "1:00", status: "current", href: "/learn/first" }] };
it("opens and closes individual modules without changing other modules", () => {
  expect(toggleModule([2], 1)).toEqual([2, 1]);
  expect(toggleModule([2, 1], 1)).toEqual([2]);
});
it("expands a partial selection, then collapses all", () => {
  const open = toggleAllModules([2], [1, 2, 3]);
  expect(open).toEqual([1, 2, 3]);
  expect(toggleAllModules(open, [1, 2, 3])).toEqual([]);
});
it("individual changes remain compatible with expand/collapse all", () => {
  expect(toggleAllModules(toggleModule([1, 2], 1), [1, 2])).toEqual([1, 2]);
  expect(toggleAllModules([], [])).toEqual([]);
});
it.each([true, false])("renders keyboard-native header and correctly controlled panel: %s", isExpanded => {
  const html = renderToStaticMarkup(createElement(CourseModule, { module: courseModule, isExpanded, onToggle: vi.fn() }));
  expect(html).toContain('<button type="button"');
  expect(html).toContain(`aria-expanded="${isExpanded}"`);
  expect(html).toContain('aria-controls="course-module-1"');
  expect(html).toContain('id="course-module-1"');
  expect(html.includes('hidden=""')).toBe(!isExpanded);
  expect(html).toContain('href="/learn/first"');
});
it("lesson module lists use native disclosures and keep locked lessons unlinked", () => {
  const html = renderToStaticMarkup(createElement(ModuleLessons, { current: 1, modules: [courseModule, { ...courseModule, number: 2, lessons: [{ title: "Locked", duration: "1:00", status: "locked" }] }] }));
  expect(html.match(/<details/g)).toHaveLength(2);
  expect(html.match(/open=""/g)).toHaveLength(1);
  expect(html.match(/<summary/g)).toHaveLength(2);
  expect(html).not.toContain('href="/learn/locked"');
});
