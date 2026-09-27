"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { authenticate } from "@/actions/auth";
import AuthInput from "./AuthInput";
import "@/styles/auth/auth.css";

export default function AuthForm() {
  const [result, submit, pending] = useActionState(authenticate, {});
  const [submittedMode, setSubmittedMode] = useState("");
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "";
  const pathname = usePathname();
  const mode = pathname === "/register" ? "register" : "login";
  const [contentMode, setContentMode] = useState(mode);
  const isLogin = contentMode === "login";
  const state = submittedMode === contentMode ? result : {};

  useEffect(() => {
    // Swap the content halfway through the 700ms panel slide.
    const noSlide = window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 700px)").matches;
    const timer = window.setTimeout(() => setContentMode(mode), noSlide ? 0 : 350);

    return () => window.clearTimeout(timer);
  }, [mode]);

  return (
    <main className={`auth-page auth-page-${mode}`}>
      <div className="auth-layout">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link href="/" className="auth-logo">
          <Image src="/images/frc-academy-logo.png" alt="F.R.C Creator Academy" width={2172} height={724} priority />
        </Link>
        <header className="auth-heading">
          <p className="auth-eyebrow">{isLogin ? "WELCOME BACK" : "JOIN THE ACADEMY"}</p>
          <h1 id="auth-title">{isLogin ? "Log In to Your Account" : "Create Your Account"}</h1>
          <p className="auth-description">{isLogin
            ? "Continue your creator journey and pick up where you left off."
            : "Start your creator journey today and gain access to all courses."}</p>
        </header>
        <form key={contentMode} className="auth-form" action={submit} onSubmit={() => setSubmittedMode(contentMode)} noValidate>
          <input type="hidden" name="mode" value={contentMode} /><input type="hidden" name="callbackUrl" value={callbackUrl} />
          {!isLogin && <AuthInput id="full-name" label="Full Name" type="text" placeholder="Your full name" autoComplete="name" error={state.fieldErrors?.name} />}
          <AuthInput id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" error={state.fieldErrors?.email} />
          <AuthInput id="password" label="Password" type="password" placeholder={isLogin ? "Your password" : "Create a password"}
            autoComplete={isLogin ? "current-password" : "new-password"} error={state.fieldErrors?.password}
            hint={!isLogin ? "At least 8 characters. Letters or numbers alone are enough; no uppercase or special character required." : undefined} />
          {!isLogin && <AuthInput id="confirm-password" label="Confirm Password" type="password" placeholder="Confirm your password" autoComplete="new-password" error={state.fieldErrors?.confirmPassword} />}
          {isLogin && (
            <div className="auth-options">
              <label className="auth-remember"><input type="checkbox" name="remember" defaultChecked /> Keep me signed in</label>
              <button type="button" className="auth-forgot" disabled>Forgot password?</button>
            </div>
          )}
          {state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success} <Link href="/login">Log In</Link></p>}
          <button type="submit" className="auth-primary" disabled={pending || mode !== contentMode}>
            {pending ? "Please wait..." : isLogin ? "Log In" : "Create Account"}<ArrowRight size={20} aria-hidden="true" />
          </button>
        </form>
        <div className="auth-divider"><span>OR</span></div>
        <button type="button" className="auth-google" disabled>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.4 13.93a6 6 0 0 1 0-3.86V7.48H3.06a10 10 0 0 0 0 9.04l3.34-2.59Z" />
            <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.88-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.48l3.34 2.59C7.19 7.71 9.4 5.95 12 5.95Z" />
          </svg>
          Continue with Google
        </button>
        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <Link href={isLogin ? "/register" : "/login"} scroll={false}>{isLogin ? "Create Account" : "Log In"}</Link>
        </p>
      </section>
      <div className="auth-visual" aria-hidden="true" />
      </div>
    </main>
  );
}
