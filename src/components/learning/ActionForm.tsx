"use client";
import { useActionState } from "react";
import type { ActionState } from "@/lib/validation";
export default function ActionForm({ action, slug, label, className, disabled = false }: { action: (state: ActionState, data: FormData) => Promise<ActionState>; slug: string; label: string; className?: string; disabled?: boolean }) {
  const [state, submit, pending] = useActionState(action, {});
  return <form action={submit}><input type="hidden" name="slug" value={slug} /><button className={className} disabled={pending || disabled} type="submit">{pending ? "Saving..." : label}</button>{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}</form>;
}
