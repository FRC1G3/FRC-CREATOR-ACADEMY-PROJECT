import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "@/styles/learning.css";
import "./globals.css";
import "@/styles/interactions.css";
import AccountNavigation from "@/components/layout/AccountNavigation";
import { Suspense } from "react";
import Footer from "@/components/layout/Footer";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<nav aria-label="Navigation loading"><span>F.R.C Creator Academy</span><span role="status">Loading navigation...</span></nav>}><AccountNavigation /></Suspense>
        {children}
        <Footer />
      </body>
    </html>
  );
}
