import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Music2 } from "lucide-react";
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
            <div className="footer-socials" aria-label="Social channels coming soon">
              <button type="button" disabled aria-label="YouTube — coming soon"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" /><path d="m10 9 6 3-6 3Z" fill="#171018" /></svg></button>
              <button type="button" disabled aria-label="Instagram — coming soon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></button>
              <button type="button" disabled aria-label="TikTok — coming soon"><Music2 size={18} /></button>
              <button type="button" disabled aria-label="X — coming soon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 3h5l11 18h-5L4 3ZM20 3 4 21" /></svg></button>
            </div>
          </div>

          <div className="footer-links">
            <h3>Product</h3>
            <ul>
              <li><span aria-disabled="true">Features</span></li>
              <li><Link href="/roadmap">Roadmap</Link></li>
              <li><span aria-disabled="true">Pricing</span></li>
              <li><span aria-disabled="true">FAQ</span></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Company</h3>
            <ul>
              <li><span aria-disabled="true">About</span></li>
              <li><span aria-disabled="true">Blog</span></li>
              <li><span aria-disabled="true">Contact</span></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Legal</h3>
            <ul>
              <li><span aria-disabled="true">Terms of Service</span></li>
              <li><span aria-disabled="true">Privacy Policy</span></li>
              <li><span aria-disabled="true">Cookie Policy</span></li>
            </ul>
          </div>

          <div className="footer-newsletter">
            <span className="footer-eyebrow">Stay updated</span>
            <h3>Join Our Newsletter</h3>
            <p>Get the latest updates, new lessons<br />and creator tips.</p>
            <div className="footer-email">
              <input type="email" placeholder="Your email" aria-label="Your email" autoComplete="email" />
              <button type="button" disabled aria-label="Newsletter signup — coming soon" title="Newsletter signup is coming soon"><ArrowRight size={20} /></button>
            </div>
            <small>No spam. Unsubscribe anytime.</small>
          </div>
        </div>
      </div>
    </footer>
  );
}
