import { useEffect, useRef, useState } from "react";
import { Mail, MessageCircle, ArrowUp } from "lucide-react";

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`footer ${isVisible ? "footer-visible" : ""}`}
    >
      <div className="footer-container">

        {/* Main Footer */}
        <div className="footer-main">

          {/* Brand */}
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              <span className="footer-logo-mark">R</span>
              <span>RECALLDOSE</span>
            </a>

            <p>Your daily dose of medical recall.</p>

            <span className="footer-tagline">
              Learn. Recall. Practice. Master.
            </span>
          </div>

          {/* Platform */}
          <div className="footer-column">
            <h3>Platform</h3>

            <a href="/">Home</a>
            <a href="#features">Subjects</a>
            <a href="#exams">Exams</a>
            <a href="#how-it-works">How it works</a>
            <a href="#">About</a>
          </div>

          {/* Support */}
          <div className="footer-column">
            <h3>Support</h3>

            <a href="#">Contact & Feedback</a>
            <a href="#">Report a Problem</a>
            <a href="#">Help Center</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>

          {/* Creator */}
          <div className="footer-column creator-column">
            <h3>Created by</h3>

            <a
              href="https://mariam-nabil.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="creator-name"
            >
              Mariam Nabil
            </a>

            <p>
              Designed & developed with
              <br />
              curiosity, code & caffeine.
            </p>

            <div className="footer-socials" aria-label="Contact and social links">
              <a href="mailto:YOUR_EMAIL_HERE" aria-label="Email Mariam" title="Email" className="social-email">
                <Mail size={19} strokeWidth={1.9} aria-hidden="true" />
              </a>
              <a href="https://wa.me/YOUR_WHATSAPP_NUMBER" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp" className="social-whatsapp">
                <MessageCircle size={19} strokeWidth={1.9} aria-hidden="true" />
              </a>
              <a href="https://www.linkedin.com/in/mariam-nabil-ba719a352/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" className="social-linkedin">
                <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M5.2 3.4a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM3.4 9.4H7v11.2H3.4V9.4Zm5.8 0h3.4v1.5h.05c.47-.9 1.62-1.85 3.34-1.85 3.57 0 4.23 2.35 4.23 5.4v6.15h-3.55v-5.45c0-1.3-.03-2.97-1.81-2.97-1.82 0-2.1 1.42-2.1 2.88v5.54H9.2V9.4Z"/></svg>
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook" className="social-facebook">
                <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M13.4 21v-8.2h2.76l.41-3.2H13.4V7.56c0-.93.26-1.56 1.6-1.56h1.7V3.14A22 22 0 0 0 14.22 3c-2.46 0-4.14 1.5-4.14 4.26V9.6H7.3v3.2h2.78V21h3.32Z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom */}
        <div className="footer-bottom">

          <span>
            © 2026 RECALLDOSE. All rights reserved.
          </span>

          <span className="footer-credit">
            Designed & Developed by{" "}
            <a
              href="https://mariam-nabil.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mariam Nabil
            </a>
          </span>

          <a href="#top" className="footer-back-top">
            Back to top
            <ArrowUp size={15} strokeWidth={1.8} aria-hidden="true" />
          </a>

        </div>

      </div>
    </footer>
  );
};

export default Footer;