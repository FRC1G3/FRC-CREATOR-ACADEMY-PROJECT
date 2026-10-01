import { timed } from "@/lib/performance";
import BookmarkButton from "@/components/learning/BookmarkButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import LessonPlayer from "@/components/learn/LessonPlayer";
import LessonHeader from "@/components/learn/LessonHeader";
import KeyTakeaways from "@/components/learn/KeyTakeaways";
import CourseProgressCard from "@/components/learn/CourseProgressCard";
import ModuleLessons from "@/components/learn/ModuleLessons";
import { requireUser } from "@/lib/current-user";
import { accessible, LearningError, nodeHref } from "@/services/learning";
import { moduleViews } from "@/services/presentation";
import type { LessonView } from "@/types/learning";
import ActionForm from "@/components/learning/ActionForm";
import LockedLesson from "@/components/learn/LockedLesson";
import StartLesson from "@/components/learn/StartLesson";
import { completeLesson } from "@/actions/learning";
import { getPrisma } from "@/lib/prisma";
import { streak } from "@/lib/learning-rules";
import "@/styles/learn/lesson-page.css";

async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const user = await requireUser(`/learn/${lessonId}`);
  const access = await accessible(user.id, "LESSON", lessonId).catch(error => { if (error instanceof LearningError) return false as const; throw error; });
  if (access === false) {
    const context = await getPrisma().lesson.findFirst({ where: { slug: lessonId, status: "PUBLISHED", module: { course: { status: "PUBLISHED" } } }, select: { module: { select: { course: { select: { slug: true } } } } } });
    return <LockedLesson courseSlug={context?.module.course.slug} />;
  }
  if (!access) notFound();
  const { state } = access;
  const lesson = state.lessons.find(l => l.id === access.id)!;
  const courseModule = state.course.modules.find(m => m.id === lesson.moduleId)!;
  const currentIndex = state.nodes.findIndex(n => n.id === access.node.id);
  const previous = state.nodes.slice(0, currentIndex).filter(n => n.type !== "REWARD").at(-1);
  const next = state.nodes.slice(currentIndex + 1).find(n => n.type !== "REWARD");
  const [activityLessons, activityQuizzes, savedBookmark, artwork] = await Promise.all([getPrisma().lessonProgress.findMany({ where: { userId: user.id, completedAt: { not: null } }, select: { completedAt: true } }), getPrisma().quizAttempt.findMany({ where: { userId: user.id, completedAt: { not: null } }, select: { completedAt: true } }), getPrisma().lessonBookmark.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } }, select: { id: true } }), getPrisma().lesson.findUniqueOrThrow({where:{id:lesson.id},select:{thumbnailUrl:true}})]);
  const activityStreak = streak([...activityLessons, ...activityQuizzes].flatMap(a => a.completedAt ? [a.completedAt] : []));
  const lessonPreview: LessonView = { number: lesson.order, title: lesson.title, course: state.course.title, module: courseModule.title, moduleNumber: courseModule.order, duration: `${Math.ceil(lesson.durationSeconds / 60)} min`, description: lesson.description, thumbnail: artwork.thumbnailUrl ?? "/images/hero.png", videoUrl: lesson.videoUrl, progress: state.percentage, completed: `${state.completedLessons} / ${state.totalLessons}`, streak: activityStreak.days, quizzes: `${state.passed.size} / ${state.course.quizzes.length}`, status: state.completed.has(lesson.id) ? "Completed" : "In Progress", time: "Video not available yet" };
  return (
    <main className="lesson-page">
      <div className="lesson-container">
        <div className="lesson-breadcrumb" aria-label="Breadcrumb">
          <Link href="/courses">Courses</Link><ChevronRight />
          <Link href={`/courses/${state.course.slug}`}>{lessonPreview.course}</Link><ChevronRight />
          <Link href={`/courses/${state.course.slug}#module-${courseModule.order}`}>Module {courseModule.order}</Link><ChevronRight /><span aria-current="page">{lessonPreview.title}</span>
        </div>
        <div className="lesson-layout">
          <div className="lesson-main">
            {!state.progress.some(p => p.lessonId === lesson.id && p.status !== "NOT_STARTED") && <StartLesson slug={lesson.slug} />}
            <LessonPlayer lessonPreview={lessonPreview} />
            <LessonHeader lessonPreview={lessonPreview}>
              <ActionForm action={completeLesson} slug={lesson.slug} label={state.completed.has(lesson.id) ? "Completed" : "Mark as Complete"} optimisticLabel="Completed" className="lesson-complete" disabled={state.completed.has(lesson.id)} />
              {next && next.status !== "locked" ? <Link href={nodeHref(state, next)}>{next.type === "QUIZ" ? "Next Checkpoint" : "Next Lesson"} →</Link> : <button disabled type="button">{next ? "Complete lesson to continue" : "Final lesson"}</button>}
            </LessonHeader>
            <BookmarkButton kind="lesson" id={lesson.id} initialSaved={Boolean(savedBookmark)} />
            {previous && <Link href={nodeHref(state, previous)}>← Previous step</Link>}
            <KeyTakeaways lessonTakeaways={[lesson.description]} />
          </div>
          <aside className="lesson-sidebar" aria-label="Course progress and lesson navigation">
            <CourseProgressCard lessonPreview={lessonPreview} />
            <ModuleLessons modules={moduleViews(state)} current={courseModule.order} />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default async function ProfiledPage(...args: Parameters<typeof LessonPage>) {
  return timed("route.lesson", () => LessonPage(...args));
}
