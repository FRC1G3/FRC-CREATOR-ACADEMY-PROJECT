import { timed } from "@/lib/performance";
import Link from "next/link";
import QuizHeader from "@/components/quiz/QuizHeader";
import { notFound } from "next/navigation";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import { requireUser } from "@/lib/current-user";
import { accessible, LearningError } from "@/services/learning";
import { getPrisma } from "@/lib/prisma";
import LockedQuiz from "@/components/quiz/LockedQuiz";
import "@/styles/quiz/quiz-page.css";

async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const user = await requireUser(`/quizzes/${quizId}`);
  const access = await accessible(user.id, "QUIZ", quizId).catch(error => { if (error instanceof LearningError) return false as const; throw error; });
  if (access === false) {
    const context = await getPrisma().quiz.findFirst({where:{slug:quizId,status:"PUBLISHED",course:{status:"PUBLISHED"}},select:{course:{select:{slug:true}}}});
    return <LockedQuiz courseSlug={context?.course.slug} />;
  }
  if (!access) notFound();
  // Explicit projection: neither correctness nor explanations cross the client boundary.
  const quiz = await getPrisma().quiz.findUniqueOrThrow({ where: { id: access.id }, select: { title: true, description: true, module: { select: { title: true } }, questions: { orderBy: { order: "asc" }, select: { id: true, text: true, options: { orderBy: { order: "asc" }, select: { id: true, text: true } } } } } });
  const publicQuiz = { id: quizId, title: quiz.title, description: quiz.description ?? "Test your knowledge and unlock the next stage.", module: quiz.module?.title ?? access.state.course.title, questions: quiz.questions };
  return (
    <main className="quiz-page">
      <div className="quiz-container">
        <div className="student-breadcrumb" aria-label="Breadcrumb"><Link href="/courses">Courses</Link><span aria-hidden="true">/</span><Link href={`/courses/${access.state.course.slug}`}>{access.state.course.title}</Link><span aria-hidden="true">/</span><span aria-current="page">{quiz.title}</span></div>
        <Link className="student-back" href={`/courses/${access.state.course.slug}`}>Back to Course</Link>
        <p className="quiz-leave-note">Leaving this page discards your unsubmitted answers.</p>
        <QuizHeader quizPreview={publicQuiz} />
        <QuizQuestion quiz={publicQuiz} />
      </div>
    </main>
  );
}

export default async function ProfiledPage(...args: Parameters<typeof QuizPage>) {
  return timed("route.quiz", () => QuizPage(...args));
}
