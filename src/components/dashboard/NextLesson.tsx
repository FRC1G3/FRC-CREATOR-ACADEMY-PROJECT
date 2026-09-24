import "@/styles/dashboard/next-lesson.css";
import Image from "next/image";
import { ChevronRight, Clock3, Play } from "lucide-react";
import { nextLesson } from "@/data/dashboard-data";

export default function NextLesson() {
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
        <button type="button" disabled aria-label="Understanding CTR lesson"><ChevronRight size={22} /></button>
      </div>
    </section>
  );
}
