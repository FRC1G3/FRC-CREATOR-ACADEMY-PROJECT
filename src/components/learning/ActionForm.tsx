"use client";
import { useActionState, useOptimistic } from "react";
import { unstable_rethrow } from "next/navigation";
import type { ActionState } from "@/lib/validation";
export default function ActionForm({ action, slug, label, className, disabled = false, optimisticLabel }: { action: (state: ActionState, data: FormData) => Promise<ActionState>; slug: string; label: string; className?: string; disabled?: boolean; optimisticLabel?: string }) {
  const [optimistic, setOptimistic] = useOptimistic(false);
  const [state, submit, pending] = useActionState(async (previous: ActionState, data: FormData) => {
    if (optimisticLabel) setOptimistic(true);
    try { return await action(previous, data); }
    catch (error) { unstable_rethrow(error); return { error: "Unable to save. Please try again." }; }
  }, {});
  return <form action={submit} aria-busy={pending}><input type="hidden" name="slug" value={slug} /><button className={className} disabled={pending || disabled} type="submit">{optimistic ? `${optimisticLabel} · Saving...` : pending ? "Saving..." : label}</button>{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}</form>;
}
