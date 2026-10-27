import { useEffect, useRef, useState } from "react";

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

            <div className="footer-socials">

              {/* Portfolio */}
              <a
                href="https://mariam-nabil.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Portfolio"
                title="Portfolio"
              >
                <i className="fa-solid fa-globe"></i>
              </a>

              {/* WhatsApp */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/mariam-nabil-ba719a352/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <i className="fa-brands fa-linkedin-in"></i>
              </a>

              {/* Facebook */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
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

          <a href="#" className="footer-back-top">
            Back to top
            <span>↑</span>
          </a>

        </div>

      </div>
    </footer>
  );
};

export default Footer;