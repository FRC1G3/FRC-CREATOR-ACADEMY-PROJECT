import Image from "next/image";
import Link from "next/link";
import "@/styles/landing/footer.css";

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <Link href="/" className="footer-logo" aria-label="F.R.C Creator Academy home">
          <Image src="/images/frc-academy-logo.png" alt="F.R.C Creator Academy" width={2172} height={724} />
        </Link>

        <div className="footer-grid">
          <div className="footer-brand">
            <h2>Same Passion.<br /><span>Bigger Journey.</span></h2>
            <p>Learn. Create. Grow. Together.<br />Practical skills for the next generation<br />of creators.</p>
          </div>

          <div className="footer-links">
            <h3>Product</h3>
            <ul>
              <li><Link href="/courses">Courses</Link></li>
              <li><Link href="/roadmap">Roadmap</Link></li>
              <li><Link href="/achievements">Achievements</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Your Academy</h3>
            <ul>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/bookmarks">Bookmarks</Link></li>
              <li><Link href="/profile">Profile</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
