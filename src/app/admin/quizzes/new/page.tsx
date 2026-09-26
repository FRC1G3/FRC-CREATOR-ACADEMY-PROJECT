import AdminPageHeader from "@/components/admin/AdminPageHeader";
import QuizForm from "@/components/admin/QuizForm";

export default function NewQuizFormPage() {
  return <><AdminPageHeader eyebrow="quizzes Management" title="New Quiz" description="Create questions for a course checkpoint." /><QuizForm /></>;
}
