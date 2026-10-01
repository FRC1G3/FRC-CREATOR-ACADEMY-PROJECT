import type { Module, Lesson, Quiz, Question, AnswerOption, Badge } from "@/generated/prisma/client";
export type Catalog = { id: string; title: string; modules: { id: string; title: string; order: number }[] }[];
export type LessonEdit = Lesson & { module: Module };
export type QuizEdit = Quiz & { questions: (Question & { options: AnswerOption[] })[]; _count: { attempts: number } };
export type BadgeEdit = Badge;
