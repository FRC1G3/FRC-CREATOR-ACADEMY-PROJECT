import "@/styles/landing/hero.css";
import Image from "next/image";
export default function Hero() {
  return (
    <section className="landing-hero">
      <h1>
        Learn. <br />
        Create. <br />
        <span className="grow">Grow.</span>
      </h1>
      <p className="opacity-[0.7] mb-5 w-[300]">
        A step-by-step learning platform for future creators
      </p>
      <button className="start">
        Start Learning
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="56"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.875"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-arrow-right"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
      <div className="profiles">
        <div className="images">
          <Image
            src="/images/profiles/frc.PNG"
            alt="Profile"
            width={45}
            height={45}
          />
          <Image
            src="/images/profiles/harun.jpg"
            alt="Profile"
            width={45}
            height={45}
          />

          <Image
            src="/images/profiles/noijat.jpg"
            alt="Profile"
            width={45}
            height={45}
          />

          <Image
            src="/images/profiles/miri.jpg"
            alt="Profile"
            width={45}
            height={45}
          />
        </div>
        <div className="profiles-text">
          <strong>10K+</strong>
          <span>future creators</span>
        </div>
      </div>
    </section>
  );
}
