import Image from "next/image";
import { Play, Volume2, Settings, Maximize, Captions, RectangleHorizontal } from "lucide-react";
import type { LessonView } from "@/types/learning";

export default function LessonPlayer({ lessonPreview }: { lessonPreview: LessonView }) {
  if (lessonPreview.videoUrl && !lessonPreview.videoUrl.includes("example.com")) return <section className="lesson-player app-card"><video controls preload="metadata" poster={lessonPreview.thumbnail} src={lessonPreview.videoUrl} style={{ width: "100%", display: "block", aspectRatio: "16 / 9" }} /></section>;
  return (
    <section className="lesson-player app-card" aria-label="Lesson video preview">
      <Image src={lessonPreview.thumbnail} alt="Thumbnail Psychology: creator, thumbnail examples and YouTube visual" width={1672} height={941} sizes="(max-width: 950px) 95vw, 60vw" priority />
      <div className="lesson-player-controls" aria-label="Video controls preview">
        <progress value={0} max={100} aria-label="Video playback preview" />
        <div className="lesson-player-toolbar">
          <button type="button" disabled aria-label="Play"><Play fill="currentColor" /></button>
          <button type="button" disabled aria-label="Volume"><Volume2 /></button>
          <span>{lessonPreview.time}</span>
          <div className="lesson-player-options">
            <button type="button" disabled aria-label="Captions"><Captions /></button>
            <button type="button" disabled aria-label="Settings"><Settings /></button>
            <button type="button" disabled aria-label="Theater mode"><RectangleHorizontal /></button>
            <button type="button" disabled aria-label="Fullscreen"><Maximize /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
