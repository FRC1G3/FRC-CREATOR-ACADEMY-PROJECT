import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { imageSource, validImageSource } from "../src/lib/image-source";
import DatabaseImage from "../src/components/learning/DatabaseImage";
import { profileSchema } from "../src/lib/validation";
import { courseSchema } from "../src/lib/admin-validation";

it("keeps local assets optimized", () => expect(imageSource("/images/profiles/frc.PNG")).toEqual({ src: "/images/profiles/frc.PNG", unoptimized: false }));
it("renders external HTTPS images without the server optimizer", () => {
  const html = renderToStaticMarkup(createElement(DatabaseImage, { src: "https://cdn.example.org/image.png", alt: "", width: 45, height: 45 }));
  expect(html).toContain('src="https://cdn.example.org/image.png"');
  expect(html).not.toContain("/_next/image");
});
it.each([null, "", "http://example.org/a.png", "//example.org/a.png", "javascript:alert(1)", "data:image/png;base64,abc", "https://user:pass@example.org/a.png", "/images/../private", "/images/%2e%2e/private", "/images/%5cprivate", "/images/%00.png", "/images/bad%path"])("falls back safely for %s", value => {
  expect(validImageSource(value)).toBeNull();
  expect(imageSource(value).src).toBe("/images/hero.png");
});
it("uses the same source rules for admin and profile validation", () => {
  for (const url of ["/images/hero.png", "https://example.org/a.png", "http://example.org/a.png", "/images/../private"]) {
    const accepted = Boolean(validImageSource(url));
    expect(profileSchema.safeParse({ name: "Creator", bio: "", avatarUrl: url }).success).toBe(accepted);
    expect(courseSchema.safeParse({ title: "Course", slug: "course", instructorName: "Creator", level: "BEGINNER", status: "DRAFT", thumbnailUrl: url }).success).toBe(accepted);
  }
});
