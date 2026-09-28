"use client";

import "@/styles/landing/menu.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Image from "next/image";
import DatabaseImage from "@/components/learning/DatabaseImage";
import Link from "next/link";
import { LogOut, Route, UsersRound, ChevronsLeft, House, TvMinimalPlay, BookOpen,ChartNoAxesCombined,Star,Wrench,Bookmark,NotebookPen,Settings } from "lucide-react";
type MenuProps = {
  user: { name: string; avatarUrl: string | null; role: string } | null;
  isSidebarOpen: boolean;
  setisSidebarOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  logoutPending: boolean;
};
export default function Menu({ isSidebarOpen, setisSidebarOpen, user, onLogout, logoutPending }: MenuProps) {
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isSidebarOpen) return;
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setisSidebarOpen(false); }
      if (event.key !== "Tab") return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keyboard);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", keyboard); if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus(); };
  }, [isSidebarOpen, setisSidebarOpen]);
  return (
    <><button type="button" className="student-menu-backdrop" hidden={!isSidebarOpen} tabIndex={-1} aria-label="Close navigation menu" onClick={() => setisSidebarOpen(false)} />
    <section
      ref={panelRef}
      role="dialog"
      aria-modal={isSidebarOpen || undefined}
      id="site-menu"
      aria-label="Main menu"
      inert={!isSidebarOpen}
      onKeyDown={(event) => { if (event.key === "Escape") setisSidebarOpen(false); }}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a[href]")) {
          setisSidebarOpen(false);
        }
      }}
      className={`menu ${isSidebarOpen ? "open" : ""} h-[100vh] w-[220px]`}
    >
      <div className="menu-top">
        <Link href="/" aria-label="F.R.C Creator Academy home"><Image
          src="/images/frc-academy-logo.png"
          width={2172}
          height={724}
          alt="F.R.C Creator Academy"
        /></Link>
        <button ref={closeRef} type="button" className="menu-close" aria-label="Close navigation menu"
          onClick={() => setisSidebarOpen(false)}
        ><ChevronsLeft className="cursor-pointer size-10" aria-hidden="true" /></button>
      </div>
      <div className="menu-bottom">
        {user?.role === "ADMIN" && <div className="menu-icons"><Link href="/admin">Admin Dashboard</Link></div>}
        <div className="menu-icons" data-active={pathname === "/dashboard" ? "true" : undefined}>
          <Link href="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined}><House className="size-5" /> <span>Dashboard</span></Link>
        </div>
        <div className="menu-icons" data-active={pathname === "/courses" || pathname.startsWith("/courses/") || pathname.startsWith("/learn/") || pathname.startsWith("/quizzes/") ? "true" : undefined}>
        <Link href="/courses" aria-current={pathname === "/courses" || pathname.startsWith("/courses/") || pathname.startsWith("/learn/") || pathname.startsWith("/quizzes/") ? "page" : undefined}><TvMinimalPlay /> <span>Courses</span></Link>
      </div>
      <div className="menu-icons" data-active={pathname === "/roadmap" ? "true" : undefined}>
        <Link href="/roadmap" aria-current={pathname === "/roadmap" ? "page" : undefined}><Route /> <span>Roadmap</span></Link>
      </div>
      <div className="menu-icons" aria-disabled="true" title="Unavailable in this university demo">
         <ChartNoAxesCombined /> <span>Progress</span>
      </div>
      <div className="menu-icons" data-active={pathname === "/achievements" ? "true" : undefined}>
        <Link href="/achievements" aria-current={pathname === "/achievements" ? "page" : undefined}><Star /> <span>Achievements</span></Link>
      </div>
      <div className="menu-icons" aria-disabled="true" title="Unavailable in this university demo">
       <UsersRound /> <span>Community</span>
      </div>
      <div className="menu-icons" aria-disabled="true" title="Unavailable in this university demo">
        <Wrench /> <span>Creator Tools</span>
      </div>
      <div className="menu-icons" aria-disabled="true" title="Unavailable in this university demo">
        <NotebookPen /><span>Notes</span>
      </div>
      
      <div className="menu-i-bottom">
        <div className="menu-icons" data-active={pathname === "/bookmarks" ? "true" : undefined}>
        <Link href="/bookmarks" aria-current={pathname === "/bookmarks" ? "page" : undefined}><Bookmark /> <span>Bookmarks</span></Link>
      </div>
      <div className="menu-icons" aria-disabled="true" title="Unavailable in this university demo">
        <Settings /> <span>Settings</span>
      </div>
      <div className="menu-icons" aria-disabled="true" title="Unavailable in this university demo">
        <BookOpen /> <span>Library</span>
      </div>
      </div>
     
      </div>
      <div className="menu-profile">
        <Link href={user ? "/profile" : "/login"} className="menu-profile-link" aria-current={pathname === "/profile" ? "page" : undefined}>
          {user && <DatabaseImage fallback="/images/profiles/frc.PNG" src={user.avatarUrl} alt="Profile" width={42} height={42} />}
          <div className="menu-profile-text">
            <strong>{user?.name ?? "Guest"}</strong>
            <span>{user ? "View Profile" : "Log in"}</span>
          </div>
        </Link>
        {user && <button type="button" onClick={onLogout} disabled={logoutPending} aria-label={logoutPending ? "Logging out" : "Log out"} aria-busy={logoutPending}><LogOut className="menu-profile-logout" size={22} />{logoutPending && <span>Logging out...</span>}</button>}
      </div>
    </section></>
  );
}
