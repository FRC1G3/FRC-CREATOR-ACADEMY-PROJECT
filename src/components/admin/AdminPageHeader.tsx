import type { ReactNode } from "react";

export default function AdminPageHeader({ eyebrow, title, description, children }: {
  eyebrow: string; title: string; description: string; children?: ReactNode;
}) {
  return (
    <header className="admin-management-header">
      <div><p className="section-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
      {children}
    </header>
  );
}
