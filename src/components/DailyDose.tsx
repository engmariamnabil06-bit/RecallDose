import { useEffect, useRef, useState } from "react";

const DailyDose = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`daily-dose-section ${
        isVisible ? "daily-dose-visible" : ""
      }`}
    >
      <div className="daily-dose-container">

        {/* Heading */}
        <div className="daily-dose-heading">
          <span className="section-eyebrow">
            YOUR DAILY RECALL DOSE
          </span>

          <h2>
            Small dose.
            <span>Big difference.</span>
          </h2>

          <p>
            You don't need hours every day.
            <br />
            You need the right questions at the right time.
          </p>
        </div>

        {/* Main Content */}
        <div className="daily-dose-content">

          {/* Main Dose Card */}
          <div className="dose-main-card">

            <div className="dose-card-glow"></div>

            <div className="dose-card-top">
              <div>
                <span className="dose-label">
                  TODAY'S DOSE
                </span>

                <h3>
                  Ready to recall?
                </h3>
              </div>

              <div className="dose-status">
                <span className="status-dot"></span>
                Daily
              </div>
            </div>

            {/* Progress */}
            <div className="dose-progress-area">

              <div className="progress-ring">

                <svg
                  viewBox="0 0 120 120"
                  className="progress-svg"
                >
                  <circle
                    className="progress-ring-bg"
                    cx="60"
                    cy="60"
                    r="50"
                  />

                  <circle
                    className="progress-ring-value"
                    cx="60"
                    cy="60"
                    r="50"
                  />
                </svg>

                <div className="progress-center">
                  <strong>0%</strong>
                  <span>complete</span>
                </div>

              </div>

              <div className="dose-info">

                <div className="dose-stat">
                  <strong>10</strong>
                  <span>Questions</span>
                </div>

                <div className="dose-divider"></div>

                <div className="dose-stat">
                  <strong>~10</strong>
                  <span>Minutes</span>
                </div>

                <div className="dose-divider"></div>

                <div className="dose-stat">
                  <strong>+1</strong>
                  <span>Streak</span>
                </div>

              </div>

            </div>

            <div className="dose-topics">

              <span>Pharmacology</span>
              <span>Mixed Recall</span>
              <span>Exam Focus</span>

            </div>

            <button className="dose-button">
              Start Today's Dose
              <span>→</span>
            </button>

          </div>

          {/* Side Cards */}
          <div className="dose-side">

            {/* Streak */}
            <div className="dose-mini-card streak-card">

              <div className="mini-card-icon">
                🔥
              </div>

              <div className="mini-card-content">
                <span>Your streak</span>
                <strong>
                  0 <small>days</small>
                </strong>
                <p>
                  Start today and keep it going.
                </p>
              </div>

              <div className="mini-card-orbit"></div>

            </div>

            {/* Progress */}
            <div className="dose-mini-card progress-card">

              <div className="mini-card-icon progress-mini-icon">
                ✦
              </div>

              <div className="mini-card-content">
                <span>Today's progress</span>

                <div className="mini-progress">
                  <div className="mini-progress-fill"></div>
                </div>

                <p>
                  0 of 10 questions completed
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Message */}
        <div className="dose-bottom">
          <span>
            A few minutes today.
          </span>

          <strong>
            A stronger memory tomorrow.
          </strong>
        </div>

      </div>
    </section>
  );
};

export default DailyDose;