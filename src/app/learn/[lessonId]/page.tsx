import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import LessonPlayer from "@/components/learn/LessonPlayer";
import LessonHeader from "@/components/learn/LessonHeader";
import KeyTakeaways from "@/components/learn/KeyTakeaways";
import CourseProgressCard from "@/components/learn/CourseProgressCard";
import ModuleLessons from "@/components/learn/ModuleLessons";
import { lessonPreview } from "@/data/lesson-data";
import "@/styles/learn/lesson-page.css";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  if (lessonId !== "thumbnail-psychology") notFound();
  return (
    <main className="lesson-page">
      <div className="lesson-container">
        <div className="lesson-breadcrumb" aria-label="Breadcrumb">
          <Link href="/courses">Courses</Link><ChevronRight />
          <Link href="/courses/youtube">{lessonPreview.course}</Link><ChevronRight />
          <span>Module 2</span><ChevronRight /><span aria-current="page">{lessonPreview.title}</span>
        </div>
        <div className="lesson-layout">
          <div className="lesson-main">
            <LessonPlayer />
            <LessonHeader />
            <KeyTakeaways />
          </div>
          <aside className="lesson-sidebar" aria-label="Course progress and lesson navigation">
            <CourseProgressCard />
            <ModuleLessons />
          </aside>
        </div>
      </div>
    </main>
  );
}
