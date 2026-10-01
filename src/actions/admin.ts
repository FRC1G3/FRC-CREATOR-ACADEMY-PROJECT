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
    if (command.operation === "save" && ["course", "lesson", "quiz"].includes(command.entity)) {
      const name = command.entity === "course" ? "Course" : command.entity === "lesson" ? "Lesson" : "Quiz";
      return { success: `${name} ${command.id ? "updated" : "created"} successfully.`, id: row.id, url: `/admin/${section}` };
    }
    if (command.operation === "save" && command.entity === "badge") return { success: `Badge ${command.id ? "updated" : "created"} successfully.`, id: row.id };
    if (command.operation === "save" && command.entity === "node") return { success: command.id ? "Roadmap node updated successfully." : "Roadmap node added successfully.", id: row.id };
    if (command.operation === "publish" || command.operation === "unpublish") return { success: command.operation === "publish" ? "Published successfully." : "Set to Draft successfully.", id: row.id };
    return { success: "Changes saved.", id: row.id, url: command.operation === "save" && ["course", "lesson", "quiz"].includes(command.entity) ? `/admin/${section}/${row.id}/edit` : undefined };
  } catch (error) { return { error: adminError(error) }; }
}
