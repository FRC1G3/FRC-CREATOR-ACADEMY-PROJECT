import "@/styles/landing/roadmap-preview.css";
import { BookOpen,CircleCheck,ChartNoAxesColumnIncreasing } from "lucide-react";
export default function RoadmapPreview() {
  return (
    <section className="roadMap h-[100vh]">
      <span>
        <span>STRUCTURED</span> LEARNING
      </span>
      <h2 className="section-title">
        A Clear <br /> Roadmap
      </h2>
      <p className="section-description">
        Follow a step-by-step path designed for creators. Learn at your own pace
        and unlock new skills.
      </p>
      <div className="mapEmojis">
        <div className="mapEmojis-icons">
            <BookOpen size={40} color="#ff1f2d" />
            <span>Watch</span>
            <span className="section-description">Lessons</span>
        </div>
        <div className="mapEmojis-icons">
            <CircleCheck size={40} color="#ff1f2d" />
            <span>Complete</span>
            <span className="section-description" >
              Quizzes
            </span>
        </div>
        <div className="mapEmojis-icons">
            <ChartNoAxesColumnIncreasing size={40} color="#ff1f2d" strokeWidth={4} strokeLinecap="butt" />
            <span>Unlock</span>
            <span className="section-description">New Levels</span>
        </div>
      </div>
      <p className="roadmap-checkpoint">3 Lessons → Checkpoint Quiz → Score 80%+ → Next Stage Unlocks</p>
    </section>
  );
}
