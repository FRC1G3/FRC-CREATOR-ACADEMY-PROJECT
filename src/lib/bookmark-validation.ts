import { z } from "zod";
export const bookmarkSchema = z.object({ kind: z.enum(["course", "lesson"]), id: z.string().min(1).max(150), saved: z.boolean() }).strict();
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
