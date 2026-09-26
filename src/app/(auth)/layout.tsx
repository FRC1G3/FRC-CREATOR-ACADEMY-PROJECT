import AuthForm from "@/components/auth/AuthForm";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthForm />
      {children}
    </>
  );
}
