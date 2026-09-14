import "@/styles/landing/lessons-preview.css";
import Image from "next/image";
export default function LessonsPrewiew() {
  return (
    <section className="lessonsP h-[100vh]">
      <Image
        src="/images/skills.png"
        width={1312}
        height={1199}
        alt="Lessons Background"
      />
      <div className="right">
        <span className="section-eyebrow">REAL KNOWLEDGE</span>
        <h2 className="section-title">Practical Lessons</h2>
        <p className="section-description mt-[20px] " >
          Learn from real examples,not just theory. <br />
          Get the knowledge you can apply right away.
        </p>
      </div>
    </section>
  );
}
