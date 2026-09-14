"use client";

import Image from "next/image";
import "@/styles/landing/hero.css";
import Sidebar from "../landing/Menu";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [isSidebarOpen, setisSidebarOpen] = useState(false);

  return (
    <nav>
      <div className="nav_left">
        <Menu
          onClick={() => setisSidebarOpen(true)}
          className="size-10 cursor-pointer"
        />

        <Image
          src="/images/frc-academy-logo.png"
          alt="F.R.C Creator Academy"
          width={2172}
          height={724}
        />
      </div>

      <div className="nav_right">
        <button className="login">Login</button>
        <button className="sign">Get Started</button>
      </div>

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setisSidebarOpen={setisSidebarOpen}
      />
    </nav>
  );
}