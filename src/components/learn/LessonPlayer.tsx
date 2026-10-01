import DatabaseImage from "@/components/learning/DatabaseImage";
import type { LessonView } from "@/types/learning";
import { imageSource } from "@/lib/image-source";
import { videoSource } from "@/lib/video";

export default function LessonPlayer({ lessonPreview }: { lessonPreview: LessonView }) {
  const video = videoSource(lessonPreview.videoUrl);
  if (video?.type === "youtube") return <section className="lesson-player app-card"><iframe loading="lazy" title={lessonPreview.title} src={video.src} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" style={{ width: "100%", display: "block", aspectRatio: "16 / 9", border: 0 }} /></section>;
  if (video?.type === "media") return <section className="lesson-player app-card"><video controls preload="metadata" poster={imageSource(lessonPreview.thumbnail).src} src={video.src} style={{ width: "100%", display: "block", aspectRatio: "16 / 9" }} /></section>;
  return (
    <section className="lesson-player app-card" aria-label="Lesson video preview">
      <DatabaseImage src={lessonPreview.thumbnail} alt={`${lessonPreview.title} preview`} width={1672} height={941} sizes="(max-width: 950px) 95vw, 60vw" priority />
      <p role="status">Video is not available for this lesson yet.</p>
    </section>
  );
}
