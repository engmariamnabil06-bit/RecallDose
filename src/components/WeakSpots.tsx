import { useEffect, useRef, useState } from "react";

const topics = [
  {
    name: "Cardiovascular",
    score: 86,
    status: "Strong",
    icon: "♡",
    color: "green",
  },
  {
    name: "CNS",
    score: 72,
    status: "Good",
    icon: "◉",
    color: "blue",
  },
  {
    name: "Antimicrobials",
    score: 48,
    status: "Needs work",
    icon: "✦",
    color: "purple",
  },
  {
    name: "Endocrine",
    score: 39,
    status: "Weak",
    icon: "⚡",
    color: "orange",
  },
];

const WeakSpots = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTopic, setActiveTopic] = useState("Endocrine");
  const [accuracy, setAccuracy] = useState(0);

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

  useEffect(() => {
    if (!isVisible) {
      setAccuracy(0);
      return;
    }

    const duration = 1800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      setAccuracy(Math.floor(easedProgress * 68));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible]);

  const activeTopicData =
    topics.find((topic) => topic.name === activeTopic) ||
    topics[3];

  return (
    <section
      ref={sectionRef}
      className={`weak-spots-section ${
        isVisible ? "weak-spots-visible" : ""
      }`}
    >
      <div className="weak-spots-container">

        {/* Heading */}
        <div className="weak-spots-heading">
          <span className="section-eyebrow">
            PERFORMANCE ANALYSIS
          </span>

          <h2>
            Don't just see your score.
            <span>Understand it.</span>
          </h2>

          <p>
            Every exam tells you more than a number.
            <br />
            Recalldose shows you exactly where your knowledge stands.
          </p>
        </div>

        {/* Main Analytics Dashboard */}
        <div className="analytics-dashboard">

          <div className="analytics-glow"></div>

          {/* Dashboard Header */}
          <div className="analytics-header">
            <div>
              <span className="analytics-label">
                LAST MOCK EXAM
              </span>

              <h3>
                Pharmacology
              </h3>
            </div>

            <div className="analytics-date">
              <span className="online-dot"></span>
              Analysis complete
            </div>
          </div>

          {/* Dashboard Main */}
          <div className="analytics-main">

            {/* Accuracy */}
            <div className="accuracy-card">

              <div className="accuracy-top">
                <span>OVERALL ACCURACY</span>

                <span className="accuracy-badge">
                  +8.4%
                </span>
              </div>

              <div className="accuracy-ring">

                <svg
                  viewBox="0 0 180 180"
                  className="accuracy-svg"
                >
                  <circle
                    className="accuracy-ring-bg"
                    cx="90"
                    cy="90"
                    r="72"
                  />

                  <circle
                    className="accuracy-ring-progress"
                    cx="90"
                    cy="90"
                    r="72"
                  />
                </svg>

                <div className="accuracy-center">
                  <strong>
                    {accuracy}%
                  </strong>

                  <span>
                    accuracy
                  </span>
                </div>

              </div>

              <div className="accuracy-message">
                <span>✦</span>
                You're getting stronger.
              </div>

            </div>

            {/* Topic Performance */}
            <div className="topic-performance">

              <div className="topic-header">
                <div>
                  <span>TOPIC PERFORMANCE</span>
                  <h4>
                    Where you stand
                  </h4>
                </div>

                <span className="topic-count">
                  4 topics
                </span>
              </div>

              <div className="topic-list">

                {topics.map((topic, index) => (
                  <button
                    key={topic.name}
                    className={`topic-row ${
                      activeTopic === topic.name
                        ? "topic-active"
                        : ""
                    }`}
                    onMouseEnter={() =>
                      setActiveTopic(topic.name)
                    }
                    onFocus={() =>
                      setActiveTopic(topic.name)
                    }
                    style={{
                      transitionDelay: `${0.15 + index * 0.1}s`,
                    }}
                  >

                    <div className="topic-info">

                      <div
                        className={`topic-icon ${topic.color}`}
                      >
                        {topic.icon}
                      </div>

                      <div>
                        <strong>
                          {topic.name}
                        </strong>

                        <span>
                          {topic.status}
                        </span>
                      </div>

                    </div>

                    <div className="topic-bar-wrapper">

                      <div className="topic-bar">
                        <div
                          className={`topic-bar-fill ${topic.color}`}
                          style={{
                            width: isVisible
                              ? `${topic.score}%`
                              : "0%",
                          }}
                        ></div>
                      </div>

                    </div>

                    <strong className="topic-score">
                      {topic.score}%
                    </strong>

                    <span className="topic-arrow">
                      →
                    </span>

                  </button>
                ))}

              </div>

            </div>
          </div>

          {/* Active Topic Insight */}
          <div className="topic-insight">

            <div className="insight-icon">
              {activeTopicData.icon}
            </div>

            <div className="insight-content">

              <span>
                RECALL INSIGHT
              </span>

              <h4>
                {activeTopicData.name} needs more practice.
              </h4>

              <p>
                Your current accuracy is{" "}
                <strong>
                  {activeTopicData.score}%
                </strong>
                . Focused recall sessions could
                help strengthen this topic.
              </p>

            </div>

            <button className="insight-button">
              Practice this topic
              <span>→</span>
            </button>

          </div>

        </div>

        {/* Bottom Insights */}
        <div className="performance-cards">

          <div className="performance-card weak-card">

            <div className="performance-card-top">
              <div className="performance-icon">
                ⚡
              </div>

              <span className="card-status weak">
                FOCUS
              </span>
            </div>

            <span className="performance-label">
              WEAKEST AREA
            </span>

            <h3>
              Endocrine
            </h3>

            <p>
              This is where your next recall session
              should start.
            </p>

            <div className="card-action">
              Strengthen it
              <span>→</span>
            </div>

          </div>

          <div className="performance-card strong-card">

            <div className="performance-card-top">
              <div className="performance-icon">
                ✦
              </div>

              <span className="card-status strong">
                MASTERED
              </span>
            </div>

            <span className="performance-label">
              STRONGEST AREA
            </span>

            <h3>
              Cardiovascular
            </h3>

            <p>
              Great recall. Keep it fresh with
              occasional practice.
            </p>

            <div className="card-action">
              Keep practicing
              <span>→</span>
            </div>

          </div>

          <div className="performance-card progress-card-analysis">

            <div className="performance-card-top">
              <div className="performance-icon">
                ↗
              </div>

              <span className="card-status improving">
                +8.4%
              </span>
            </div>

            <span className="performance-label">
              SINCE LAST EXAM
            </span>

            <h3>
              You're improving.
            </h3>

            <p>
              Your accuracy increased compared
              with your previous attempt.
            </p>

            <div className="improvement-line">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

          </div>

        </div>

        {/* Bottom Statement */}
        <div className="weak-spots-bottom">
          <span>
            Your mistakes are data.
          </span>

          <strong>
            Use them to get better.
          </strong>
        </div>

      </div>
    </section>
  );
};

export default WeakSpots;