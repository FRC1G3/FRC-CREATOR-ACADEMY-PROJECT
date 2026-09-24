import "@/styles/dashboard/continue-learning.css";
import { Bookmark, MoveRight,ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export default function ContinueLearning() {
  return (
    <section className="continue-learning app-card col-6 ">
      <div className="continue-top">
        <span>Continue Learning</span>
        <Link href="/courses/youtube" className="view-course">
          View Course <ArrowRight className="size-5" />
        </Link>
      </div>
      <div className="continue-body">
        <Image
          src="/images/dashboard/section2.png"
          alt="F.R.C Creator Academy"
          width={1448}
          height={1086}
        ></Image>
        <div className="c-b-right">
          <span className="p-[3px] bg-[#0f1c2cd9]">YouTube Creator Mastery</span>
        <h2>Thumbnail Psychology</h2>
        <span>Module 2 · Lesson 5</span>
        <div className="progress-bar">
          <progress value={68} max={100} aria-label="Course completion" />
          <span>68%</span>
        </div>
        <div className="continue-button">
          <Link href="/courses/youtube">
            Continue Learning
            <MoveRight />{" "}
          </Link>{" "}
          <button type="button" className="continue-bookmark" disabled aria-label="Save lesson"><Bookmark /></button>
        </div>
        </div>
      </div>
    </section>
  );
}
