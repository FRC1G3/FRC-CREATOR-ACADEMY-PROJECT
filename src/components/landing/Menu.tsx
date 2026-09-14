import "@/styles/landing/menu.css";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import {UsersRound, ChevronsLeft, House, TvMinimalPlay, BookOpen,ChartNoAxesCombined,Star,Wrench,Bookmark,NotebookPen,Settings } from "lucide-react";
type MenuProps = {
  isSidebarOpen: boolean;
  setisSidebarOpen: (isOpen: boolean) => void;
};
export default function Menu({ isSidebarOpen, setisSidebarOpen }: MenuProps) {
  return (
    <section
      className={`menu ${isSidebarOpen ? "open" : ""} h-[100vh] w-[220px]`}
    >
      <div className="menu-top">
        <Image
          className="cursor-pointer"
          src="/images/frc-academy-logo.png"
          width={120}
          height={120}
          alt="Logo"
        />
        <ChevronsLeft
          onClick={() => setisSidebarOpen(false)}
          className="cursor-pointer size-10"
        />
      </div>
      <div className="menu-bottom">
        <div className="menu-icons">
          <House className="size-5" /> <span>Dashboard</span>
        </div>
        <div className="menu-icons">
        <TvMinimalPlay /> <span>Courses</span>
      </div>
      <div className="menu-icons">
         <ChartNoAxesCombined /> <span>Progress</span>
      </div>
      <div className="menu-icons">
        <Star /> <span>Achievements</span>
      </div>
      <div className="menu-icons">
       <UsersRound /> <span>Community</span>
      </div>
      <div className="menu-icons">
        <Wrench /> <span>Creator Tools</span>
      </div>
      <div className="menu-icons">
        <NotebookPen /><span>Notes</span>
      </div>
      
      <div className="menu-i-bottom">
        <div className="menu-icons">
        <Bookmark /> <span>Bookmarks</span>
      </div>
      <div className="menu-icons">
        <Settings /> <span>Settings</span>
      </div>
      <div className="menu-icons">
        <BookOpen /> <span>Library</span>
      </div>
      </div>
     
      </div>
      <div className="menu-profile">
        <Link href="/profile" className="menu-profile-link" onClick={() => setisSidebarOpen(false)}>
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
