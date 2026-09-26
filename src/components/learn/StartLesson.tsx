"use client";
import { useEffect } from "react";
import { startLesson } from "@/actions/learning";
export default function StartLesson({ slug }: { slug: string }) {
  useEffect(() => { void startLesson(slug).catch(() => { /* Completion can still be retried explicitly. */ }); }, [slug]);
  return null;
}
