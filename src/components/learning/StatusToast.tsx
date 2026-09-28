"use client";
import { useEffect, useState } from "react";
export function notifyStatus(message: string) { window.dispatchEvent(new CustomEvent("academy-status", { detail: message })); }
export default function StatusToast() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = (event: Event) => { setMessage((event as CustomEvent<string>).detail); clearTimeout(timer); timer = setTimeout(() => setMessage(""), 5000); };
    window.addEventListener("academy-status", show);
    return () => { clearTimeout(timer); window.removeEventListener("academy-status", show); };
  }, []);
  return <div role="status" aria-live="polite" className={`student-toast${message ? " visible" : ""}`}>{message}</div>;
}
