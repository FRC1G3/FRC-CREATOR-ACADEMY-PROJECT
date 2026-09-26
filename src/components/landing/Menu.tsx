"use client";

import "@/styles/landing/menu.css";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Route, UsersRound, ChevronsLeft, House, TvMinimalPlay, BookOpen,ChartNoAxesCombined,Star,Wrench,Bookmark,NotebookPen,Settings } from "lucide-react";
type MenuProps = {
  isSidebarOpen: boolean;
  setisSidebarOpen: (isOpen: boolean) => void;
};
export default function Menu({ isSidebarOpen, setisSidebarOpen }: MenuProps) {
  const pathname = usePathname();
  return (
    <section
      id="site-menu"
      aria-label="Main menu"
      inert={!isSidebarOpen}
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
        <button type="button" className="menu-close" aria-label="Close navigation menu"
          onClick={() => setisSidebarOpen(false)}
        ><ChevronsLeft className="cursor-pointer size-10" aria-hidden="true" /></button>
      </div>
      <div className="menu-bottom">
        <div className="menu-icons" data-active={pathname === "/dashboard" ? "true" : undefined}>
          <Link href="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined}><House className="size-5" /> <span>Dashboard</span></Link>
        </div>
        <div className="menu-icons" data-active={pathname === "/courses" || pathname.startsWith("/courses/") || pathname.startsWith("/learn/") || pathname.startsWith("/quizzes/") ? "true" : undefined}>
        <Link href="/courses" aria-current={pathname === "/courses" || pathname.startsWith("/courses/") || pathname.startsWith("/learn/") || pathname.startsWith("/quizzes/") ? "page" : undefined}><TvMinimalPlay /> <span>Courses</span></Link>
      </div>
      <div className="menu-icons" data-active={pathname === "/roadmap" ? "true" : undefined}>
        <Link href="/roadmap" aria-current={pathname === "/roadmap" ? "page" : undefined}><Route /> <span>Roadmap</span></Link>
      </div>
      <div className="menu-icons" aria-disabled="true">
         <ChartNoAxesCombined /> <span>Progress</span>
      </div>
      <div className="menu-icons" data-active={pathname === "/achievements" ? "true" : undefined}>
        <Link href="/achievements" aria-current={pathname === "/achievements" ? "page" : undefined}><Star /> <span>Achievements</span></Link>
      </div>
      <div className="menu-icons" aria-disabled="true">
       <UsersRound /> <span>Community</span>
      </div>
      <div className="menu-icons" aria-disabled="true">
        <Wrench /> <span>Creator Tools</span>
      </div>
      <div className="menu-icons" aria-disabled="true">
        <NotebookPen /><span>Notes</span>
      </div>
      
      <div className="menu-i-bottom">
        <div className="menu-icons" aria-disabled="true">
        <Bookmark /> <span>Bookmarks</span>
      </div>
      <div className="menu-icons" aria-disabled="true">
        <Settings /> <span>Settings</span>
      </div>
      <div className="menu-icons" aria-disabled="true">
        <BookOpen /> <span>Library</span>
      </div>
      </div>
     
      </div>
      <div className="menu-profile">
        <Link href="/profile" className="menu-profile-link" aria-current={pathname === "/profile" ? "page" : undefined}>
          <Image src="/images/profiles/frc.PNG" alt="F.R.C" width={42} height={42} />
          <div className="menu-profile-text">
            <strong>F.R.C</strong>
            <span>View Profile</span>
          </div>
        </Link>
        <LogOut className="menu-profile-logout" size={22} aria-label="Log out" />
      </div>
    </section>
  );
}
