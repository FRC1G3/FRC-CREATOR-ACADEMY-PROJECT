import "@/styles/landing/quiz-preview.css";
import Image from "next/image";
export default function QuizPreview() {
  return (
    <section className="quiz-preview">
      <div className="quiz-left">
        
      
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
          <span className="youtube-avatar">
            <Image
              src="/images/profiles/youtubecircile.png"
              alt="YouTube"
              width={45}
              height={45}
            />
          </span>
        </div>
        <div className="profiles-text">
          <strong>10K+</strong>
          <span>future creators</span>
        </div>
      </div>
      <h2 className="section-title w-[80%]">Join a Growing <span className="text-red-500">Community</span></h2>
      <p className="opacity-[0.7] mb-5 w-[300]">
        Learn,share and grow together with a community of future creators. Get
        access to exclusive content, resources and support from like-minded
        individuals.
      </p>
      </div>
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
    </section>
  );
}
