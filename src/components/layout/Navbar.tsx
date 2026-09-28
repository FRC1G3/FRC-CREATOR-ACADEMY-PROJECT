"use client";

import Image from "next/image";
import "@/styles/landing/hero.css";
import Sidebar from "../landing/Menu";
import { useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { studentLogout } from "@/actions/auth";
import { notifyStatus } from "@/components/learning/StatusToast";
import { Menu } from "lucide-react";
import Link from "next/link";
export default function Navbar({ user }: { user: { name: string; avatarUrl: string | null; role: string } | null }) {
  const [isSidebarOpen, setisSidebarOpen] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [logoutPending, startLogout] = useTransition();
  const router = useRouter();
  const identity = loggedOut ? null : user;
  function onLogout() {
    if (logoutPending) return;
    startLogout(async () => {
      try {
      const result = await studentLogout();
      if (result.success) { setLoggedOut(true); setisSidebarOpen(false); notifyStatus(result.success); router.replace("/"); }
      else notifyStatus(result.error ?? "Unable to log out.");
      } catch (error) { unstable_rethrow(error); notifyStatus("Unable to log out. Please try again."); }
    });
  }

  return (
    <><nav>
      <div className="nav_left">
        <button type="button" className="nav-menu-toggle" aria-label="Toggle navigation menu" aria-expanded={isSidebarOpen} aria-controls="site-menu"
          onClick={() => setisSidebarOpen((prev) => !prev)}
        ><Menu className="size-10 cursor-pointer" aria-hidden="true" /></button>

        <Link href="/"><Image
          src="/images/frc-academy-logo.png"
          alt="F.R.C Creator Academy"
          width={2172}
          height={724}
        /></Link>
      </div>

      <div className="nav_right">
        <Link href={identity ? "/profile" : "/login"} className="login">{identity ? identity.name : "Login"}</Link>
        <Link href="/courses" className="sign">Get Started</Link>
      </div>

    </nav>
      <Sidebar
        user={identity}
        onLogout={onLogout}
        logoutPending={logoutPending}
        isSidebarOpen={isSidebarOpen}
        setisSidebarOpen={setisSidebarOpen}
      />
    </>
  );
}
