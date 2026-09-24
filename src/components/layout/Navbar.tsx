"use client";

import Image from "next/image";
import "@/styles/landing/hero.css";
import Sidebar from "../landing/Menu";
import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
export default function Navbar() {
  const [isSidebarOpen, setisSidebarOpen] = useState(false);

  return (
    <nav>
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
        <button className="login" type="button" disabled>Login</button>
        <Link href="/courses" className="sign">Get Started</Link>
      </div>

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setisSidebarOpen={setisSidebarOpen}
      />
    </nav>
  );
}
