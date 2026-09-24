import Hero from "@/components/landing/Hero";
import RoadmapPreview from "@/components/landing/RoadmapPreview";
import LessonsPreview from "@/components/landing/LessonsPreview";
import QuizPreview from "@/components/landing/QuizPreview";
import YoutubePreview from "@/components/landing/YoutubePreview";
import Scroll from "@/components/landing/ScrollIndicator"
export default function Home() {
  
  return (
    <>
    <main className="landing-page">
      <Scroll/>
      <Hero />
      <RoadmapPreview />
      <LessonsPreview />
      <YoutubePreview />
      <QuizPreview />

      
    </main>
    </>
  );
}
