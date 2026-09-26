import "@/styles/dashboard/next-lesson.css";
import Image from "next/image";
import { ChevronRight, Clock3, Play } from "lucide-react";
import Link from "next/link";

export default function NextLesson({ nextLesson }: { nextLesson: { title: string; module: string; duration: string; href: string } }) {
  return (
    <section className="next-lesson app-card">
      <h2>Next Lesson</h2>
      <div className="next-lesson-body">
        <div className="next-lesson-image">
          <Image src="/images/hero.png" alt="YouTube creator lesson" width={1836} height={856} />
          <span><Play size={18} fill="currentColor" /></span>
        </div>
        <div className="next-lesson-text">
          <h3>{nextLesson.title}</h3>
          <p>{nextLesson.module}</p>
          <span><Clock3 size={14} />{nextLesson.duration}</span>
        </div>
        <Link href={nextLesson.href} aria-label={nextLesson.title}><ChevronRight size={22} /></Link>
      </div>
    </section>
  );
}
