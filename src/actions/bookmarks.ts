"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/current-user";
import { bookmarkSchema } from "@/lib/bookmark-validation";
import { setBookmark } from "@/services/bookmarks";
import { LearningError } from "@/services/learning";

export async function saveBookmark(value: unknown): Promise<{ saved?: boolean; error?: string }> {
  const user = await requireUser("/bookmarks");
  const parsed = bookmarkSchema.safeParse(value);
  if (!parsed.success) return { error: "Invalid bookmark." };
  try {
    const result = await setBookmark(user.id, parsed.data);
    for (const path of ["/bookmarks", "/courses", "/dashboard"]) revalidatePath(path);
    revalidatePath("/courses/[courseId]", "page"); revalidatePath("/learn/[lessonId]", "page");
    return result;
  } catch (error) { return { error: error instanceof LearningError ? error.message : "Unable to save bookmark. Please try again." }; }
}
