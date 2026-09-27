"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DatabaseImage from "@/components/learning/DatabaseImage";
import { Menu, ChevronsLeft, ArrowLeft } from "lucide-react";
import { adminNavigation } from "@/data/admin-data";

export default function AdminSidebar({ user }: { user: { name: string; avatarUrl: string | null; role: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => { if (previousFocus instanceof HTMLElement) previousFocus.focus(); };
  }, [isOpen]);

  return (
    <>
      <button className="admin-menu-toggle" type="button" aria-label="Open admin navigation" aria-controls="admin-sidebar" aria-expanded={isOpen} onClick={() => setIsOpen(true)}><Menu size={22} /></button>
      {isOpen && <button className="admin-menu-backdrop" type="button" aria-label="Close admin navigation" onClick={() => setIsOpen(false)} />}
      <aside ref={panelRef} id="admin-sidebar" role="dialog" aria-modal={isOpen ? true : undefined} aria-label="Admin navigation" className={`admin-sidebar ${isOpen ? "is-open" : ""}`} inert={!isOpen} onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
        if (event.key !== "Tab") return;
        const controls = panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)");
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}>
        <div className="admin-sidebar-top">
          <Link href="/admin" onClick={() => setIsOpen(false)}><Image src="/images/frc-academy-logo.png" alt="F.R.C Creator Academy" width={2172} height={724} /></Link>
          <button type="button" aria-label="Close admin navigation" onClick={() => setIsOpen(false)}><ChevronsLeft /></button>
        </div>
        <p className="admin-sidebar-label">ACADEMY ADMIN</p>
        <div className="admin-navigation" role="navigation" aria-label="Admin navigation">
          {adminNavigation.map(({ label, icon: Icon, href }) => (
            <Link href={href} key={label}
              aria-current={(href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)) ? "page" : undefined}
              onClick={() => setIsOpen(false)}><Icon size={20} />{label}</Link>
          ))}
        </div>
        <div className="admin-sidebar-bottom">
          <Link href="/dashboard" onClick={() => setIsOpen(false)}><ArrowLeft size={18} />Back to Academy</Link>
          <div className="admin-profile"><DatabaseImage src={user.avatarUrl} fallback="/images/profiles/frc.PNG" alt="" width={42} height={42} /><div><strong>{user.name}</strong><span>{user.role === "ADMIN" ? "Admin" : "Student"}</span></div></div>
        </div>
      </aside>
    </>
  );
}
