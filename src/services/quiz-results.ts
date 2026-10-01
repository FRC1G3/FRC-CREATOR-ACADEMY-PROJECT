import "server-only";
import type { Prisma } from "@/generated/prisma/client";

export const quizResultInclude = {
  quiz: { select: { passScore: true, course: { select: { slug: true, title: true } }, module: { select: { title: true } } } },
  answers: { orderBy: { question: { order: "asc" } }, include: { question: { include: { options: { where: { isCorrect: true }, select: { text: true } } } }, selectedOption: { select: { text: true } } } },
} satisfies Prisma.QuizAttemptInclude;
