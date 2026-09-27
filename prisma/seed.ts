import "dotenv/config";
import { getPrisma } from "../src/lib/prisma";
import { seedBadges, seedModules } from "./seed-data";
import { hashPassword } from "../src/lib/password";
import { Prisma } from "../src/generated/prisma/client";

let stage = "configuration";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo seed is for development databases only.");
  }
  const prisma = getPrisma();
  const demoPassword = process.env.SEED_PASSWORD;
  if (!demoPassword || demoPassword.length < 10) throw new Error("Set SEED_PASSWORD (at least 10 characters) for development accounts.");
  const password = await hashPassword(demoPassword);
  try {
    const db = prisma;
    stage = "users and course";
    // Independently committed upserts allow interrupted remote seeds to resume.
    // Empty updates preserve existing users, content and learning history on reruns.
    const admin = await db.user.upsert({ where: { email: "admin@frc.academy" }, update: {}, create: {
      name: "Admin User", email: "admin@frc.academy", role: "ADMIN", passwordHash: null,
    } });
    const student = await db.user.upsert({ where: { email: "student@frc.academy" }, update: {}, create: {
      name: "Samir Mammadov", email: "student@frc.academy", role: "STUDENT", passwordHash: null,
      avatarUrl: "/images/profiles/frc.PNG", bio: "Learning to create, share and grow.",
    } });
    const course = await db.course.upsert({ where: { slug: "youtube" }, update: {}, create: {
      slug: "youtube", title: "YouTube Creator Mastery", shortDescription: "Learn to build and grow your YouTube channel.",
      description: "A practical learning path covering the fundamentals, audience, strategy, production, growth and monetization.",
      thumbnailUrl: "/images/hero.png", level: "BEGINNER", status: "PUBLISHED", instructorName: "F.R.C", estimatedDuration: 264,
    } });
    for (const user of [admin, student]) {
      await db.account.upsert({ where: { providerId_accountId: { providerId: "credential", accountId: user.id } }, update: {}, create: { providerId: "credential", accountId: user.id, userId: user.id, password } });
    }
    const badges = [];
    for (const badge of seedBadges) {
      badges.push(await db.badge.upsert({ where: { slug: badge.slug }, update: {}, create: badge }));
    }
    let nodeOrder = 1;
    const completedAt = new Date("2026-09-20T12:00:00Z");
    for (const [moduleIndex, fixture] of seedModules.entries()) {
      stage = `module ${moduleIndex + 1}: ${fixture.title}`;
      console.log(`Seeding ${stage}...`);
      const order = moduleIndex + 1;
      const courseModule = await db.module.upsert({ where: { courseId_order: { courseId: course.id, order } }, update: {}, create: {
        courseId: course.id, title: fixture.title, order, description: `Practical lessons in ${fixture.title}.`,
      } });
      for (const [lessonIndex, item] of fixture.lessons.entries()) {
        const lesson = await db.lesson.upsert({ where: { slug: item.slug }, update: {}, create: {
          slug: item.slug, title: item.title, moduleId: courseModule.id, order: lessonIndex + 1,
          description: `Learn ${item.title.toLowerCase()} with practical examples and exercises.`,
          videoUrl: `https://example.com/videos/${item.slug}.mp4`,
          thumbnailUrl: item.slug === "thumbnail-psychology" ? "/images/lessons/thumbnail-psychology.png" : "/images/hero.png",
          durationSeconds: item.seconds, status: "PUBLISHED",
        } });
        await db.roadmapNode.upsert({ where: { courseId_order: { courseId: course.id, order: nodeOrder } }, update: {}, create: {
          courseId: course.id, order: nodeOrder++, type: "LESSON", title: item.title, lessonId: lesson.id,
        } });
        if (moduleIndex === 0 || (moduleIndex === 1 && lessonIndex === 0)) {
          await db.lessonProgress.upsert({ where: { userId_lessonId: { userId: student.id, lessonId: lesson.id } }, update: {}, create: {
            userId: student.id, lessonId: lesson.id, status: moduleIndex === 0 ? "COMPLETED" : "IN_PROGRESS",
            startedAt: new Date("2026-09-20T10:00:00Z"), completedAt: moduleIndex === 0 ? completedAt : null,
          } });
        }
      }
      const quiz = await db.quiz.upsert({ where: { slug: fixture.quizSlug }, update: {}, create: {
        slug: fixture.quizSlug, courseId: course.id, moduleId: courseModule.id, title: fixture.quizTitle,
        description: `Check your understanding of ${fixture.title}.`, passScore: 80, status: "PUBLISHED",
      } });
      // Fixed fixture result, not a scoring implementation. A stable seed-only ID permits reruns.
      const attemptId = "seed-student-fundamentals-attempt-1";
      const answers: { questionId: string; selectedOptionId: string; isCorrect: boolean }[] = [];
      for (const [index, item] of fixture.questions.entries()) {
        const question = await db.question.upsert({ where: { quizId_order: { quizId: quiz.id, order: index + 1 } }, update: {}, create: {
          quizId: quiz.id, order: index + 1, text: item.text, explanation: item.options[item.correct],
        } });
        for (const [optionIndex, text] of item.options.entries()) {
          const option = await db.answerOption.upsert({ where: { questionId_order: { questionId: question.id, order: optionIndex + 1 } }, update: {}, create: {
            questionId: question.id, text, order: optionIndex + 1, isCorrect: optionIndex === item.correct,
          } });
          if (moduleIndex === 0 && optionIndex === item.correct) {
            answers.push({ questionId: question.id, selectedOptionId: option.id, isCorrect: true });
          }
        }
      }
      if (moduleIndex === 0) {
        // Only four related writes share a transaction; content is already committed.
        await db.$transaction([
          db.quizAttempt.upsert({ where: { id: attemptId }, update: {}, create: {
            id: attemptId, userId: student.id, quizId: quiz.id, score: 100, passed: true,
            startedAt: new Date("2026-09-20T11:50:00Z"), completedAt,
          } }),
          ...answers.map(answer => db.quizAnswer.upsert({
            where: { attemptId_questionId: { attemptId, questionId: answer.questionId } },
            update: {}, create: { attemptId, ...answer },
          })),
        ]);
      }
      await db.roadmapNode.upsert({ where: { courseId_order: { courseId: course.id, order: nodeOrder } }, update: {}, create: {
        courseId: course.id, order: nodeOrder++, type: "QUIZ", title: fixture.quizTitle, quizId: quiz.id,
      } });
      const reward = moduleIndex === 0 ? badges[0] : moduleIndex === seedModules.length - 1 ? badges[3] : null;
      if (reward) {
        await db.roadmapNode.upsert({ where: { courseId_order: { courseId: course.id, order: nodeOrder } }, update: {}, create: {
          courseId: course.id, order: nodeOrder++, type: "REWARD", title: reward.name, badgeId: reward.id,
        } });
      }
    }
    stage = "enrollment and earned badge";
    await db.enrollment.upsert({ where: { userId_courseId: { userId: student.id, courseId: course.id } }, update: {}, create: {
      userId: student.id, courseId: course.id, enrolledAt: new Date("2026-09-19T10:00:00Z"),
    } });
    await db.userBadge.upsert({ where: { userId_badgeId: { userId: student.id, badgeId: badges[0].id } }, update: {}, create: {
      userId: student.id, badgeId: badges[0].id, earnedAt: completedAt,
    } });
    console.log("Demo seed completed. Existing credentials were preserved; new demo credentials were securely hashed.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(`Seed failed during ${stage}. Completed upserts are preserved; rerun after resolving the error.`);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const messages: Record<string, string> = { P2002: "Unique constraint conflict: check existing fixture identities.", P2003: "Foreign key conflict: check related seed records.", P2028: "Transaction failed: check remote connection availability.", P1001: "Database is unreachable.", P1000: "Database authentication failed." };
    console.error("Name: PrismaClientKnownRequestError; Code:", error.code);
    console.error(messages[error.code] ?? "Database operation failed. Check connectivity and the applied schema.");
  } else {
    console.error("Check database connectivity, SEED_PASSWORD requirements, and applied migrations. Raw error details are omitted to protect credentials.");
  }
  process.exitCode = 1;
});
