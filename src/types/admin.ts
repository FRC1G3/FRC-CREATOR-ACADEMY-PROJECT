import type { Course, Module, Lesson, Quiz, Question, AnswerOption, Badge } from "@/generated/prisma/client";
export type Catalog = (Course & { modules: Module[] })[];
export type LessonEdit = Lesson & { module: Module };
export type QuizEdit = Quiz & { questions: (Question & { options: AnswerOption[] })[]; _count: { attempts: number } };
export type BadgeEdit = Badge;
