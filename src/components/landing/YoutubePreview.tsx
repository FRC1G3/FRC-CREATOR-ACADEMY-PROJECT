import "@/styles/landing/youtube-preview.css";
import { Flame,ChartNoAxesColumnIncreasing,Star,MoveUpRight } from 'lucide-react';
export default function YoutubePreview() {
  return (
    <section className="landing-youtube ">
      <div className="growth-left w-[40%]">
        <span className=" text-2xl font-bold text-red-500">TRACK YOUR PROGRESS</span>
        <h2 className="section-heading text-7xl font-bold" >See Your <span className="text-red-500">Growth</span></h2>
        <p className="section-description mt-[20]">
          Complete lessons, pass quizzes and earn badges. Keep going and become
          a better creator every day.
        </p>
      </div>
      <div className="growth-right w-[60%]">
        <div className="badge">
            <Flame size={40} color="#ff1f2d" />
            <h2>12</h2>
                        <p className="section-description">Day Streak</p>
            <div className="badge-percent">
                <MoveUpRight className="section-eyebrow arrow" size={20} strokeWidth={3} /> <span>+3 This Week</span>
            </div>
        </div><div className="badge">
            <ChartNoAxesColumnIncreasing size={40} color="#ff1f2d" />
            <h2>68%</h2>
            <p className="section-description">Course Progress</p>
            <div className="badge-percent">
                <MoveUpRight className="section-eyebrow arrow" size={20} strokeWidth={3} /> <span>+12% This Week</span>
            </div>
        </div><div className="badge">
            <Star size={40} color="#ff1f2d" />
            <h2>6</h2>
            <p className="section-description">Badges</p>
            <div className="badge-percent">
                <MoveUpRight className="section-eyebrow arrow" size={20} strokeWidth={3} /> <span>+2 This Week</span>
            </div>
        </div>
      </div>
    </section>
  );
}
