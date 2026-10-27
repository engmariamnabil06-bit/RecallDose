import { useEffect, useRef, useState } from "react";

type Mistake = {
  id: number;
  subject: string;
  topic: string;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  mistakes: number;
};

const mistakes: Mistake[] = [
  {
    id: 1,
    subject: "Pharmacology",
    topic: "Cardiovascular",
    question:
      "Which mechanism best explains the antihypertensive effect of ACE inhibitors?",
    yourAnswer:
      "They directly block angiotensin II receptors.",
    correctAnswer:
      "They inhibit the conversion of angiotensin I to angiotensin II.",
    explanation:
      "ACE inhibitors reduce angiotensin II formation, leading to decreased vasoconstriction and reduced aldosterone secretion.",
    difficulty: "Medium",
    mistakes: 2,
  },
  {
    id: 2,
    subject: "Pharmacology",
    topic: "Endocrine",
    question:
      "Which drug is commonly used as first-line therapy for type 2 diabetes?",
    yourAnswer:
      "Glimepiride",
    correctAnswer:
      "Metformin",
    explanation:
      "Metformin is generally the foundational pharmacologic treatment for type 2 diabetes unless contraindicated.",
    difficulty: "Easy",
    mistakes: 3,
  },
  {
    id: 3,
    subject: "Pharmacology",
    topic: "Antimicrobials",
    question:
      "Which antibiotic class inhibits bacterial protein synthesis by binding to the 50S ribosomal subunit?",
    yourAnswer:
      "Aminoglycosides",
    correctAnswer:
      "Macrolides",
    explanation:
      "Macrolides such as azithromycin bind to the 50S ribosomal subunit and inhibit bacterial protein synthesis.",
    difficulty: "Medium",
    mistakes: 1,
  },
];

const MistakeBank = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [activeMistake, setActiveMistake] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

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

  const currentMistake = mistakes[activeMistake];

  const handleNext = () => {
    setShowAnswer(false);

    setActiveMistake((current) =>
      current === mistakes.length - 1 ? 0 : current + 1
    );
  };

  const handlePrevious = () => {
    setShowAnswer(false);

    setActiveMistake((current) =>
      current === 0 ? mistakes.length - 1 : current - 1
    );
  };

  return (
    <section
      ref={sectionRef}
      className={`mistake-bank-section ${
        isVisible ? "mistake-bank-visible" : ""
      }`}
    >
      <div className="mistake-bank-container">

        {/* Heading */}

        <div className="mistake-bank-heading">
          <span className="section-eyebrow">
            YOUR MISTAKE BANK
          </span>

          <h2>
            Every mistake
            <span>becomes a lesson.</span>
          </h2>

          <p>
            Don't let wrong answers disappear.
            <br />
            Recalldose keeps them where you can turn them into progress.
          </p>
        </div>

        {/* Main Area */}

        <div className="mistake-bank-layout">

          {/* Left: Mistake List */}

          <div className="mistake-list">

            <div className="mistake-list-header">
              <div>
                <span>RECENT MISTAKES</span>
                <h3>
                  Your recall gaps
                </h3>
              </div>

              <div className="mistake-counter">
                {mistakes.length}
                <span>saved</span>
              </div>
            </div>

            <div className="mistake-items">

              {mistakes.map((mistake, index) => (
                <button
                  key={mistake.id}
                  className={`mistake-item ${
                    activeMistake === index
                      ? "mistake-item-active"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveMistake(index);
                    setShowAnswer(false);
                  }}
                >

                  <div className="mistake-number">
                    0{index + 1}
                  </div>

                  <div className="mistake-item-content">

                    <div className="mistake-item-top">
                      <span>
                        {mistake.topic}
                      </span>

                      <small>
                        {mistake.mistakes}x missed
                      </small>
                    </div>

                    <strong>
                      {mistake.question}
                    </strong>

                  </div>

                  <span className="mistake-item-arrow">
                    →
                  </span>

                </button>
              ))}

            </div>

          </div>

          {/* Right: Active Mistake */}

          <div className="mistake-review">

            <div className="mistake-review-glow"></div>

            <div className="mistake-review-header">

              <div className="review-topic">
                <span className="review-topic-icon">
                  ✦
                </span>

                <div>
                  <span>
                    {currentMistake.subject}
                  </span>

                  <strong>
                    {currentMistake.topic}
                  </strong>
                </div>
              </div>

              <span
                className={`difficulty difficulty-${currentMistake.difficulty.toLowerCase()}`}
              >
                {currentMistake.difficulty}
              </span>

            </div>

            <div className="review-question">

              <span className="question-label">
                QUESTION
              </span>

              <h3>
                {currentMistake.question}
              </h3>

            </div>

            <div className="answer-section">

              <div className="answer-row wrong-answer">

                <div className="answer-icon">
                  ×
                </div>

                <div>
                  <span>
                    YOUR ANSWER
                  </span>

                  <p>
                    {currentMistake.yourAnswer}
                  </p>
                </div>

              </div>

              <div
                className={`answer-row correct-answer ${
                  showAnswer
                    ? "correct-answer-visible"
                    : ""
                }`}
              >

                <div className="answer-icon">
                  ✓
                </div>

                <div>
                  <span>
                    CORRECT ANSWER
                  </span>

                  <p>
                    {showAnswer
                      ? currentMistake.correctAnswer
                      : "Reveal the correct answer"}
                  </p>
                </div>

              </div>

            </div>

            {showAnswer && (
              <div className="mistake-explanation">

                <div className="explanation-icon">
                  💡
                </div>

                <div>
                  <span>
                    WHY?
                  </span>

                  <p>
                    {currentMistake.explanation}
                  </p>
                </div>

              </div>
            )}

            <div className="review-actions">

              <button
                className="reveal-button"
                onClick={() =>
                  setShowAnswer((current) => !current)
                }
              >
                {showAnswer
                  ? "Hide explanation"
                  : "Reveal answer"}

                <span>
                  {showAnswer ? "↑" : "↓"}
                </span>
              </button>

              <button
                className="practice-button"
                onClick={() => {
                  setShowAnswer(false);
                  handleNext();
                }}
              >
                Practice Again
                <span>→</span>
              </button>

            </div>

            <div className="review-navigation">

              <button
                onClick={handlePrevious}
                aria-label="Previous mistake"
              >
                ←
              </button>

              <div className="review-progress">
                {mistakes.map((_, index) => (
                  <span
                    key={index}
                    className={
                      index === activeMistake
                        ? "active"
                        : ""
                    }
                  ></span>
                ))}
              </div>

              <button
                onClick={handleNext}
                aria-label="Next mistake"
              >
                →
              </button>

            </div>

          </div>

        </div>

        {/* Bottom CTA */}

        <div className="mistake-bank-cta">

          <div className="mistake-cta-content">

            <div className="mistake-cta-icon">
              ↗
            </div>

            <div>
              <span>
                READY TO FIX YOUR WEAK SPOTS?
              </span>

              <h3>
                Turn your mistakes into mastery.
              </h3>
            </div>

          </div>

          <button className="mistake-cta-button">
            Practice My Mistakes
            <span>→</span>
          </button>

        </div>

        {/* Bottom Statement */}

        <div className="mistake-bank-bottom">
          <span>
            Wrong answers aren't failures.
          </span>

          <strong>
            They're directions.
          </strong>
        </div>

      </div>
    </section>
  );
};

export default MistakeBank;