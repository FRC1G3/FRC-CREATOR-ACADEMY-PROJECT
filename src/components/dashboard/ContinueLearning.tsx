import "@/styles/dashboard/continue-learning.css";
import { MoveRight,ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export default function ContinueLearning({ course, title, detail, progress, href, courseHref, bookmark }: { course: string; title: string; detail: string; progress: number; href: string; courseHref: string; bookmark?: React.ReactNode }) {
  return (
    <section className="continue-learning app-card col-6 ">
      <div className="continue-top">
        <span>Continue Learning</span>
        <Link href={courseHref} className="view-course">
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
          <span className="p-[3px] bg-[#0f1c2cd9]">{course}</span>
        <h2>{title}</h2>
        <span>{detail}</span>
        <div className="progress-bar">
          <progress value={progress} max={100} aria-label="Course completion" />
          <span>{progress}%</span>
        </div>
        <div className="continue-button">
          <Link href={href}>
            Continue Learning
            <MoveRight />{" "}
          </Link>{" "}
          {bookmark}
        </div>
        </div>
      </div>
    </section>
  );
}
