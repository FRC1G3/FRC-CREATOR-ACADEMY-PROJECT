"use client";

import { useEffect, useRef, useState } from "react";
import "@/styles/landing/hero.css";
export default function ScrollIndicator() {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [sectionNumber, setSectionNumber] = useState(1);
  const [sectionCount, setSectionCount] = useState(0);

  const goToSection = (index: number) => {
    const sections = Array.from(
      indicatorRef.current?.closest("main")?.querySelectorAll<HTMLElement>(":scope > section") ?? [],
    ).filter((section) => section.getBoundingClientRect().height > 0);
    sections[index]?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  useEffect(() => {
    const main = indicatorRef.current?.closest("main");
    if (!main) return;

    let frame = 0;
    const updateSection = () => {
      frame = 0;
      const sections = Array.from(main.querySelectorAll<HTMLElement>(":scope > section"))
        .filter((section) => section.getBoundingClientRect().height > 0);
      const midpoint = window.innerHeight / 2;
      let active = 1;

      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= midpoint) {
          active = index + 1;
        }
      });

      setSectionNumber(active);
      setSectionCount(sections.length);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateSection);
    };

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(main);
    main.querySelectorAll(":scope > section").forEach((section) => observer.observe(section));
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <div className="scroll-indicator" ref={indicatorRef}>
      <span className="scroll-number">{String(sectionNumber).padStart(2, "0")}</span>

      <div className="scroll-track">
        <span className="scroll-active-dot" aria-hidden="true"></span>

        {Array.from({ length: sectionCount }, (_, index) => (
          <button
            key={index}
            type="button"
            className={`scroll-small-dot dot-${index}`}
            style={{ top: `${sectionCount > 1 ? (index / (sectionCount - 1)) * 100 : 0}%` }}
            aria-label={`Go to section ${String(index + 1).padStart(2, "0")}`}
            aria-current={sectionNumber === index + 1 ? "step" : undefined}
            onClick={() => goToSection(index)}
          />
        ))}
      </div>

      <span className="scroll-text">Scroll</span>

      <div className="scroll-mouse">
        <span></span>
      </div>
    </div>
  );
}
