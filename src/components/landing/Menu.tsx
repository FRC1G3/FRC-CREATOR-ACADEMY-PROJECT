"use client";

import "@/styles/landing/menu.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Image from "next/image";
import DatabaseImage from "@/components/learning/DatabaseImage";
import Link from "next/link";
import { logout } from "@/actions/auth";
import { LogOut, Route, UsersRound, ChevronsLeft, House, TvMinimalPlay, BookOpen,ChartNoAxesCombined,Star,Wrench,Bookmark,NotebookPen,Settings } from "lucide-react";
type MenuProps = {
  user: { name: string; avatarUrl: string | null; role: string } | null;
  isSidebarOpen: boolean;
  setisSidebarOpen: (isOpen: boolean) => void;
};
export default function Menu({ isSidebarOpen, setisSidebarOpen, user }: MenuProps) {
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isSidebarOpen) return;
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    return () => { if (previousFocus instanceof HTMLElement) previousFocus.focus(); };
  }, [isSidebarOpen]);
  return (
    <section
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
        <Image
          src="/images/frc-academy-logo.png"
          width={2172}
          height={724}
          alt="F.R.C Creator Academy"
        />
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
        <div className="menu-icons" aria-disabled="true" title="Unavailable in this university demo">
        <Bookmark /> <span>Bookmarks</span>
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
        <Link href="/profile" className="menu-profile-link" aria-current={pathname === "/profile" ? "page" : undefined}>
          <DatabaseImage fallback="/images/profiles/frc.PNG" src={user?.avatarUrl} alt="Profile" width={42} height={42} />
          <div className="menu-profile-text">
            <strong>{user?.name ?? "Guest"}</strong>
            <span>View Profile</span>
          </div>
        </Link>
        {user && <form action={logout}><button type="submit" aria-label="Log out"><LogOut className="menu-profile-logout" size={22} /></button></form>}
      </div>
    </section>
  );
}
