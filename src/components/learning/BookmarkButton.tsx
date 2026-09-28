"use client";
import { Bookmark } from "lucide-react";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { saveBookmark } from "@/actions/bookmarks";
export default function BookmarkButton({ kind, id, initialSaved, className = "bookmark-button" }: { kind: "course" | "lesson"; id: string; initialSaved: boolean; className?: string }) {
  const [saved, setSaved] = useState(initialSaved), [error, setError] = useState("");
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const label = optimistic ? `Remove ${kind} bookmark` : `Bookmark ${kind}`;
  return <span className="bookmark-control"><button type="button" className={className} aria-label={label} title={label} aria-pressed={optimistic} aria-busy={pending} disabled={pending} onClick={() => {
    if (busy.current) return;
    busy.current = true; setError("");
    startTransition(async () => {
      setOptimistic(!saved);
      try { const result = await saveBookmark({ kind, id, saved: !saved }); if (result.error) setError(result.error); else setSaved(result.saved === true); }
      catch (error) { unstable_rethrow(error); setError("Unable to save bookmark. Please try again."); }
      finally { busy.current = false; }
    });
  }}><Bookmark size={20} fill={optimistic ? "currentColor" : "none"} /></button>{error && <small role="alert">{error}</small>}</span>;
}
