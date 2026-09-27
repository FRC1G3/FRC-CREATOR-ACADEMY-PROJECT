import AuthForm from "@/components/auth/AuthForm";
import { Suspense } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<main className="auth-page"><p role="status">Loading sign in...</p></main>}><AuthForm /></Suspense>
      {children}
    </>
  );
}
