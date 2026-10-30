import { useEffect, useRef, useState } from "react";
import { Sparkles, Timer, Target, ChartNoAxesCombined } from "lucide-react";

const ExamSimulator = () => {
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
      className={`exam-section ${
        isVisible ? "exam-visible" : ""
      }`}
      id="exams"
    >
      <div className="exam-container">

        {/* Heading */}
        <div className="exam-heading">
          <span className="section-eyebrow">
            EXAM SIMULATOR
          </span>

          <h2>
            Practice like
            <span>it's the real thing.</span>
          </h2>

          <p>
            Test your knowledge under pressure.
            <br />
            Build confidence before the real exam.
          </p>
        </div>

        {/* Main Exam Preview */}
        <div className="exam-preview">

          <div className="exam-preview-glow"></div>

          {/* Header */}
          <div className="exam-header">

            <div className="exam-title-area">
              <div className="exam-icon">
                <Sparkles size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>

              <div>
                <span>MOCK EXAM</span>

                <h3>
                  Pharmacology
                </h3>
              </div>
            </div>

            <div className="exam-live">
              <span></span>
              Ready
            </div>

          </div>

          {/* Exam Body */}
          <div className="exam-body">

            {/* Main Info */}
            <div className="exam-main-info">

              <span className="exam-category">
                CARDIOVASCULAR SYSTEM
              </span>

              <h4>
                Test your understanding.
              </h4>

              <p>
                Questions designed to challenge
                your recall, reasoning, and
                clinical thinking.
              </p>

              <div className="exam-tags">
                <span>MCQ</span>
                <span>Clinical Cases</span>
                <span>Exam Mode</span>
              </div>

            </div>

            {/* Stats */}
            <div className="exam-stats">

              <div className="exam-stat">
                <span className="exam-stat-icon">
                  ?
                </span>

                <div>
                  <strong>20</strong>
                  <span>Questions</span>
                </div>
              </div>

              <div className="exam-stat">
                <span className="exam-stat-icon timer-icon">
                  ⏱
                </span>

                <div>
                  <strong>30</strong>
                  <span>Minutes</span>
                </div>
              </div>

              <div className="exam-stat">
                <span className="exam-stat-icon target-icon">
                  ◉
                </span>

                <div>
                  <strong>3</strong>
                  <span>Difficulty levels</span>
                </div>
              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="exam-footer">

            <div className="exam-footer-info">
              <div className="exam-progress-mini">
                <span></span>
              </div>

              <p>
                Simulate the pressure.
                <strong> Master the recall.</strong>
              </p>
            </div>

            <button className="exam-button">
              Start Exam
              <span>→</span>
            </button>

          </div>

        </div>

        {/* Feature Cards */}
        <div className="exam-features">

          <div className="exam-feature">
            <div className="exam-feature-icon">
              <Timer size={20} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div>
              <h3>Timed Exams</h3>

              <p>
                Practice managing your time
                just like the real exam.
              </p>
            </div>
          </div>

          <div className="exam-feature">
            <div className="exam-feature-icon">
              <Target size={20} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div>
              <h3>Exam Style</h3>

              <p>
                MCQs and clinical cases built
                around active recall.
              </p>
            </div>
          </div>

          <div className="exam-feature">
            <div className="exam-feature-icon">
              <ChartNoAxesCombined size={20} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div>
              <h3>Performance Analysis</h3>

              <p>
                Know exactly where you are
                strong and where you need work.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="exam-bottom">
          <span>
            Don't wait for the exam to find your weak spots.
          </span>

          <strong>
            Find them here.
          </strong>
        </div>

      </div>
    </section>
  );
};

export default ExamSimulator;