import type { ReactNode } from "react";

export default function AdminFormField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="admin-form-field"><span>{label}</span>{children}</label>;
}
