import Link from "next/link";
import RoadmapSummary from "@/components/roadmap/RoadmapSummary";
import RoadmapNode from "@/components/roadmap/RoadmapNode";
import { roadmapNodes } from "@/data/roadmap-data";
import "@/styles/roadmap/roadmap.css";

export default function RoadmapPage() {
  return (
    <main className="roadmap-page">
      <div className="roadmap-container">
        <header className="roadmap-heading">
          <Link href="/courses/youtube">YouTube Creator Mastery</Link>
          <h1>Your Learning Roadmap</h1>
          <p>One step at a time. Learn, complete checkpoints and grow as a creator.</p>
        </header>
        <RoadmapSummary />
        <ol className="roadmap-path" aria-label="Course learning stages">
          {roadmapNodes.map((node, index) => <RoadmapNode key={node.title} node={node} index={index} last={index === roadmapNodes.length - 1} />)}
        </ol>
      </div>
    </main>
  );
}
