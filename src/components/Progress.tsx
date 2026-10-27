import { useEffect, useRef, useState } from "react";

const milestones = [
  {
    number: "01",
    title: "First Recall",
    description: "Complete your first recall session.",
    icon: "✦",
    unlocked: true,
  },
  {
    number: "02",
    title: "Recall Rookie",
    description: "Solve 50 medical questions.",
    icon: "◉",
    unlocked: true,
  },
  {
    number: "03",
    title: "Memory Builder",
    description: "Reach a 7-day recall streak.",
    icon: "🔥",
    unlocked: false,
  },
  {
    number: "04",
    title: "Topic Master",
    description: "Master your first medical topic.",
    icon: "◆",
    unlocked: false,
  },
];

const Progress = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [xp, setXp] = useState(0);
  const [questions, setQuestions] = useState(0);

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
      setXp(0);
      setQuestions(0);
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

      setXp(Math.floor(easedProgress * 680));
      setQuestions(Math.floor(easedProgress * 347));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className={`progress-section ${
        isVisible ? "progress-visible" : ""
      }`}
    >
      <div className="progress-container">

        {/* Heading */}

        <div className="progress-heading">
          <span className="section-eyebrow">
            YOUR PROGRESS
          </span>

          <h2>
            Every recall
            <span>moves you forward.</span>
          </h2>

          <p>
            Progress isn't about studying longer.
            <br />
            It's about becoming better at remembering.
          </p>
        </div>

        {/* Main Progress Dashboard */}

        <div className="progress-dashboard">

          <div className="progress-dashboard-glow"></div>

          {/* Top */}

          <div className="progress-dashboard-top">

            <div className="level-area">

              <div className="level-badge">
                <span>LVL</span>
                <strong>04</strong>
              </div>

              <div>
                <span className="level-label">
                  CURRENT RECALL LEVEL
                </span>

                <h3>
                  Memory Builder
                </h3>

                <p>
                  Keep recalling. You're building
                  stronger memory every day.
                </p>
              </div>

            </div>

            <div className="xp-area">

              <div className="xp-numbers">
                <span>XP</span>

                <strong>
                  {xp.toLocaleString()}
                </strong>

                <small>
                  / 1,000
                </small>
              </div>

              <div className="xp-bar">
                <div
                  className="xp-bar-fill"
                  style={{
                    width: isVisible ? "68%" : "0%",
                  }}
                ></div>
              </div>

              <span className="xp-next">
                320 XP to next level
              </span>

            </div>

          </div>

          {/* Stats */}

          <div className="progress-stats">

            <div className="progress-stat-card">

              <div className="progress-stat-icon streak">
                🔥
              </div>

              <div>
                <span>
                  CURRENT STREAK
                </span>

                <strong>
                  6 <small>days</small>
                </strong>

                <p>
                  Keep it alive.
                </p>
              </div>

            </div>

            <div className="progress-stat-card">

              <div className="progress-stat-icon questions">
                ?
              </div>

              <div>
                <span>
                  QUESTIONS SOLVED
                </span>

                <strong>
                  {questions.toLocaleString()}
                </strong>

                <p>
                  And counting.
                </p>
              </div>

            </div>

            <div className="progress-stat-card">

              <div className="progress-stat-icon accuracy">
                %
              </div>

              <div>
                <span>
                  ACCURACY
                </span>

                <strong>
                  78<small>%</small>
                </strong>

                <p>
                  +8.4% this month.
                </p>
              </div>

            </div>

            <div className="progress-stat-card">

              <div className="progress-stat-icon mastered">
                ✦
              </div>

              <div>
                <span>
                  TOPICS MASTERED
                </span>

                <strong>
                  12
                </strong>

                <p>
                  Keep expanding.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Journey */}

        <div className="progress-journey">

          <div className="journey-heading">

            <div>
              <span className="section-eyebrow">
                YOUR JOURNEY
              </span>

              <h3>
                Small milestones.
                <span>Real progress.</span>
              </h3>
            </div>

            <span className="journey-complete">
              2 / 4 unlocked
            </span>

          </div>

          <div className="milestones">

            <div className="journey-line">
              <div className="journey-line-fill"></div>
            </div>

            {milestones.map((milestone, index) => (
              <div
                key={milestone.number}
                className={`milestone ${
                  milestone.unlocked
                    ? "milestone-unlocked"
                    : ""
                }`}
                style={{
                  transitionDelay: `${0.25 + index * 0.15}s`,
                }}
              >

                <div className="milestone-node">

                  <span>
                    {milestone.icon}
                  </span>

                </div>

                <div className="milestone-number">
                  {milestone.number}
                </div>

                <h4>
                  {milestone.title}
                </h4>

                <p>
                  {milestone.description}
                </p>

                <span className="milestone-status">
                  {milestone.unlocked
                    ? "Unlocked"
                    : "Locked"}
                </span>

              </div>
            ))}

          </div>

        </div>

        {/* Progress Cards */}

        <div className="progress-insights">

          <div className="progress-insight-card">

            <div className="insight-card-icon">
              ↑
            </div>

            <div>
              <span>
                THIS MONTH
              </span>

              <h3>
                You're improving.
              </h3>

              <p>
                Your recall accuracy is higher
                than your previous month.
              </p>
            </div>

            <strong>
              +8.4%
            </strong>

          </div>

          <div className="progress-insight-card">

            <div className="insight-card-icon">
              ⏱
            </div>

            <div>
              <span>
                STUDY SMARTER
              </span>

              <h3>
                12 min / day
              </h3>

              <p>
                Your average daily recall time.
              </p>
            </div>

            <strong>
              Optimal
            </strong>

          </div>

          <div className="progress-insight-card">

            <div className="insight-card-icon">
              ✦
            </div>

            <div>
              <span>
                NEXT GOAL
              </span>

              <h3>
                1,000 XP
              </h3>

              <p>
                Reach the next Recall Level.
              </p>
            </div>

            <strong>
              68%
            </strong>

          </div>

        </div>

        {/* Bottom */}

        <div className="progress-bottom">
          <span>
            Keep going.
          </span>

          <strong>
            Your future self will thank you.
          </strong>
        </div>

      </div>
    </section>
  );
};

export default Progress;