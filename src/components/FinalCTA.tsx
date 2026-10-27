import { useEffect, useRef, useState } from "react";

const FinalCTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`final-cta-section ${
        isVisible ? "final-cta-visible" : ""
      }`}
    >
      <div className="final-cta-orb final-cta-orb-one"></div>
      <div className="final-cta-orb final-cta-orb-two"></div>

      <div className="final-cta-container">

        <div className="final-cta-icon">
          <span>✦</span>
        </div>

        <span className="section-eyebrow">
          YOUR NEXT RECALL STARTS HERE
        </span>

        <h2>
          Ready to become
          <span>harder to forget?</span>
        </h2>

        <p>
          Learn it.
          Recall it.
          Practice it.
          <br />
          Master it.
        </p>

        <div className="final-cta-actions">
          <a
            href="/register"
            className="final-primary-button"
          >
            Start Your Journey
            <span>→</span>
          </a>

          <a
            href="/login"
            className="final-login-link"
          >
            Already have an account?
            <span>Log in</span>
          </a>
        </div>

        <div className="final-cta-line">
          <span></span>
          <strong>RECALLDOSE</strong>
          <span></span>
        </div>

      </div>
    </section>
  );
};

export default FinalCTA;