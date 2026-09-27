import Link from "next/link";
import { requireAdmin } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const user = await getPrisma().user.findFirst({
    where: { id: userId, role: "STUDENT" },
    select: {
      name: true,
      email: true,
      createdAt: true,
      enrollments: {
        select: { enrolledAt: true, course: { select: { title: true } } },
      },
      lessonProgress: {
        where: { status: "COMPLETED" },
        select: {
          id: true,
          completedAt: true,
          lesson: { select: { title: true } },
        },
      },
      quizAttempts: {
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          score: true,
          passed: true,
          quiz: { select: { title: true } },
        },
      },
      badges: {
        select: { id: true, earnedAt: true, badge: { select: { name: true } } },
      },
    },
  });
  if (!user) notFound();
  return (
    <>
      <AdminPageHeader
        eyebrow="Student Management"
        title={user.name}
        description={user.email}
      >
        <Link href="/admin/students">Back to Students</Link>
      </AdminPageHeader>
      <section className="app-card admin-panel">
        <p>Joined {user.createdAt.toISOString().slice(0, 10)}</p>
        <h2>Enrollments</h2>
        {user.enrollments.length === 0 && <p>No enrollments yet.</p>}
        {user.enrollments.map((e, i) => (
          <p key={i}>{e.course.title}</p>
        ))}
        <h2>Completed lessons</h2>
        {user.lessonProgress.length === 0 && <p>No completed lessons yet.</p>}
        {user.lessonProgress.map((p) => (
          <p key={p.id}>
            {p.lesson.title} &middot;{" "}
            {p.completedAt?.toISOString().slice(0, 10)}
          </p>
        ))}
        <h2>Quiz attempts</h2>
        {user.quizAttempts.length === 0 && <p>No quiz attempts yet.</p>}
        {user.quizAttempts.map((a) => (
          <p key={a.id}>
            {a.quiz.title}: {a.score == null ? "Pending" : `${a.score}%`}{" "}
            &middot;{" "}
            {a.passed == null ? "Pending" : a.passed ? "Passed" : "Not passed"}
          </p>
        ))}
        <h2>Badges</h2>
        {user.badges.length === 0 && <p>No badges earned yet.</p>}
        {user.badges.map((b) => (
          <p key={b.id}>
            {b.badge.name} &middot; {b.earnedAt.toISOString().slice(0, 10)}
          </p>
        ))}
      </section>
    </>
  );
}
