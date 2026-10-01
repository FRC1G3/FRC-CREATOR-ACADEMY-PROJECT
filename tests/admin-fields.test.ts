import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import CourseModuleFields from "../src/components/admin/CourseModuleFields";
import AdminBadgeIcon from "../src/components/admin/AdminBadgeIcon";

it("keeps immutable parent IDs submitted while showing disabled edit selectors", () => {
  const html = renderToStaticMarkup(createElement(CourseModuleFields, { catalog: [], courseId: "course", moduleId: "module", fixed: true }));
  expect(html).toContain('type="hidden" name="courseId" value="course"');
  expect(html).toContain('type="hidden" name="moduleId" value="module"');
  expect(html.match(/disabled=""/g)).toHaveLength(2);
});
it("explains why a new lesson cannot choose an empty course/module list", () => {
  const html = renderToStaticMarkup(createElement(CourseModuleFields, { catalog: [] }));
  expect(html).toContain("Create a course first.");
  expect(html).toContain("Add a module in Course Edit");
});
it("renders each badge's own stored icon",()=>{
 for(const icon of ["play","star","flame","trophy","crown"]){const html=renderToStaticMarkup(createElement(AdminBadgeIcon,{icon}));expect(html).toContain(`lucide-${icon}`);}
 expect(renderToStaticMarkup(createElement(AdminBadgeIcon,{icon:"Star"}))).toContain("lucide-star");
});
it("keeps an empty module selector required and enabled so native validation blocks save",()=>{
 const html=renderToStaticMarkup(createElement(CourseModuleFields,{catalog:[]}));expect(html).toContain('name="moduleId" required=""');expect(html).toContain('value=""');expect(html).not.toContain('disabled=""');
});
