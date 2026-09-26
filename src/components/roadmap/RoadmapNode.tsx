import { Check, LockKeyhole, Play, Trophy } from "lucide-react";
import type { roadmapNodes } from "@/data/roadmap-data";

type RoadmapNodeProps = { node: (typeof roadmapNodes)[number]; index: number; last: boolean };

export default function RoadmapNode({ node, index, last }: RoadmapNodeProps) {
  const status = node.status === "completed" ? (node.kind === "quiz" ? "Completed · Passed" : "Completed") : node.status === "current" ? "Current" : "Locked";
  return (
    <li className={`roadmap-step ${node.status} ${index % 2 === 0 ? "right" : "left"} ${node.kind}`} aria-current={node.status === "current" ? "step" : undefined}>
      {!last && <svg className="roadmap-connector" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true"><path d={index % 2 === 0 ? "M 100 0 C 100 65, 0 75, 0 140" : "M 0 0 C 0 65, 100 75, 100 140"} /></svg>}
      <div className="roadmap-node-icon" aria-hidden="true">
        {node.kind === "reward" ? <Trophy size={25} /> : node.status === "completed" ? <Check size={23} strokeWidth={3} /> : node.status === "current" ? <Play size={24} fill="currentColor" /> : <LockKeyhole size={21} />}
      </div>
      <div className="roadmap-node-text">
        <h2>{node.title}</h2>
        <p>{node.detail}<span>·</span><strong>{status}</strong></p>
      </div>
    </li>
  );
}
