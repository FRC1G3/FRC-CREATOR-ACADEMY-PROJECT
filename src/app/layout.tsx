import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "@/styles/learning.css";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/current-user";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F.R.C Creator Academy",
  description: "Online learning platform for future creators",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar user={user ? { name: user.name, avatarUrl: user.avatarUrl, role: user.role } : null} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
