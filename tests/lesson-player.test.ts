import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import LessonPlayer from "../src/components/learn/LessonPlayer";
import type { LessonView } from "../src/types/learning";
const lesson: LessonView = { number:1,title:"Video lesson",course:"Course",module:"Module",moduleNumber:1,duration:"1 min",description:"",thumbnail:"/images/hero.png",videoUrl:"",progress:0,completed:"0 / 1",streak:0,quizzes:"0 / 1",status:"In Progress",time:"Video not available yet" };
it("renders a responsive YouTube iframe with the database URL's ID",()=>{const html=renderToStaticMarkup(createElement(LessonPlayer,{lessonPreview:{...lesson,videoUrl:"https://youtu.be/PHVuZ5I_Jb4"}}));expect(html).toContain('<iframe');expect(html).toContain('src="https://www.youtube.com/embed/PHVuZ5I_Jb4"');expect(html).toContain('allowFullScreen');expect(html).not.toContain('<video');});
it("renders a native player for direct MP4",()=>{const html=renderToStaticMarkup(createElement(LessonPlayer,{lessonPreview:{...lesson,videoUrl:"https://cdn.example.org/lesson.mp4"}}));expect(html).toContain('<video');expect(html).toContain('src="https://cdn.example.org/lesson.mp4"');expect(html).not.toContain('<iframe');});
it.each(["", "javascript:alert(1)"])("renders a safe preview for invalid/empty video %s", videoUrl => {
  const html = renderToStaticMarkup(createElement(LessonPlayer, { lessonPreview: { ...lesson, videoUrl, thumbnail: "invalid" } }));
  expect(html).toContain("Lesson video preview");
  expect(html).toContain("hero.png");
  expect(html).not.toContain("<iframe"); expect(html).not.toContain("<video");
});
