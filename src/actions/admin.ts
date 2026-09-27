"use server";
import { requireAdmin } from "@/lib/current-user";
import { commandSchema, type AdminResult } from "@/lib/admin-validation";
import { executeAdmin, adminError } from "@/services/admin";
import { revalidatePath } from "next/cache";
export async function mutateAdmin(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  try {
    const command = commandSchema.parse(input);
    const row = await executeAdmin(command);
    revalidatePath("/admin", "layout");
    for (const path of ["/courses", "/dashboard", "/profile", "/roadmap", "/achievements"]) revalidatePath(path);
    for (const path of ["/courses/[courseId]", "/learn/[lessonId]", "/quizzes/[quizId]", "/quizzes/[quizId]/result"]) revalidatePath(path, "page");
    const section = { course: "courses", lesson: "lessons", quiz: "quizzes", module: "courses", badge: "badges", node: "roadmap" }[command.entity];
    return { success: "Changes saved.", id: row.id, url: command.operation === "save" && ["course", "lesson", "quiz"].includes(command.entity) ? `/admin/${section}/${row.id}/edit` : undefined };
  } catch (error) { return { error: adminError(error) }; }
}
