import { useEffect, useRef, useState } from "react";

type Mode = {
  name: string;
  icon: string;
};

const modes: Mode[] = [
  { name: "Smart", icon: "✦" },
  { name: "Funny", icon: "☻" },
  { name: "Story", icon: "◌" },
  { name: "Rhyme", icon: "♫" },
  { name: "Acronym", icon: "A" },
];

const modeResponses: Record<
  string,
  {
    title: string;
    text: string;
    tip: string;
    mnemonic: string;
  }
> = {
  Smart: {
    title: "Let's think like a doctor.",
    text:
      "ACE inhibitors reduce the formation of angiotensin II. This decreases vasoconstriction and aldosterone secretion, which helps lower blood pressure.",
    tip:
      "When you see ACE inhibitors in an exam, think: ↓ Ang II → ↓ vasoconstriction → ↓ BP.",
    mnemonic: "ACE = Angiotensin Conversion Ends",
  },
  Funny: {
    title: "Okay, let's make it stick.",
    text:
      "ACE inhibitors basically tell the body: “Hey, let's stop making so much angiotensin II!” Less angiotensin II means less squeezing of blood vessels.",
    tip:
      "Think of ACE as the body's “pressure maker.” Block it → pressure goes down.",
    mnemonic: "ACE says: “Enough pressure!”",
  },
  Story: {
    title: "Picture this...",
    text:
      "Imagine your blood vessels as roads. Angiotensin II is the traffic officer telling every road to squeeze tighter. ACE inhibitors remove that signal, so the roads relax.",
    tip:
      "Visualize relaxed vessels whenever you see ACE inhibitors.",
    mnemonic: "No ACE → roads relax.",
  },
  Rhyme: {
    title: "Let's make it rhyme.",
    text:
      "Block ACE, let pressure fall. Less Ang II means less squeeze overall.",
    tip:
      "Short rhymes can help you retrieve mechanisms quickly during exams.",
    mnemonic: "Block ACE → Less squeeze.",
  },
  Acronym: {
    title: "One tiny memory hook.",
    text:
      "Use ACE as your recall trigger: Angiotensin Conversion Ends. It points you directly toward reduced Ang II formation.",
    tip:
      "Build your own trigger words instead of memorizing long paragraphs.",
    mnemonic: "ACE = Angiotensin Conversion Ends",
  },
};

const DrRecall = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeMode, setActiveMode] = useState("Smart");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const response = modeResponses[activeMode];

  const handleModeChange = (mode: string) => {
    if (mode === activeMode) return;

    setIsTyping(true);
    setActiveMode(mode);

    setTimeout(() => {
      setIsTyping(false);
    }, 550);
  };

  return (
    <section
      ref={sectionRef}
      className={`dr-recall-section ${
        isVisible ? "dr-recall-visible" : ""
      }`}
    >
      <div className="dr-recall-container">

        {/* Heading */}
        <div className="dr-recall-heading">
          <span className="section-eyebrow">MEET DR. RECALL</span>

          <h2>
            Your AI study partner
            <span>for smarter recall.</span>
          </h2>

          <p>
            Not just answers.
            <br />
            Explanations, memory tricks, and questions that help
            information actually stick.
          </p>
        </div>

        {/* Main AI Area */}
        <div className="dr-recall-main">

          <div className="dr-ai-glow"></div>

          {/* AI Header */}
          <div className="dr-ai-header">
            <div className="dr-ai-profile">
              <div className="dr-ai-avatar">
                <span>✦</span>
              </div>

              <div>
                <div className="dr-ai-name-row">
                  <h3>Dr. Recall</h3>
                  <span className="ai-badge">AI</span>
                </div>

                <div className="dr-ai-status">
                  <span></span>
                  Your recall assistant
                </div>
              </div>
            </div>

            <div className="dr-ai-online">
              <span></span>
              ONLINE
            </div>
          </div>

          {/* Conversation */}
          <div className="dr-conversation">

            {/* User Message */}
            <div className="dr-message user-message">
              <div className="message-label">YOU</div>

              <div className="user-bubble">
                Why did I get this question wrong?
              </div>
            </div>

            {/* AI Message */}
            <div className="dr-message ai-message">
              <div className="message-label">
                DR. RECALL
              </div>

              <div className="ai-bubble">

                {isTyping ? (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <h4>{response.title}</h4>

                    <p>{response.text}</p>

                    <div className="exam-tip">
                      <div className="tip-icon">✦</div>

                      <div>
                        <span>EXAM TIP</span>
                        <p>{response.tip}</p>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>

          </div>

          {/* Modes */}
          <div className="dr-mode-area">

            <div className="dr-mode-heading">
              <span>HOW SHOULD I EXPLAIN IT?</span>
              <small>Choose your recall style</small>
            </div>

            <div className="dr-modes">
              {modes.map((mode) => (
                <button
                  key={mode.name}
                  className={`dr-mode ${
                    activeMode === mode.name
                      ? "dr-mode-active"
                      : ""
                  }`}
                  onClick={() =>
                    handleModeChange(mode.name)
                  }
                >
                  <span>{mode.icon}</span>
                  {mode.name}
                </button>
              ))}
            </div>

          </div>

          {/* Memory Trick */}
          <div className="dr-memory-card">

            <div className="memory-icon">
              ✦
            </div>

            <div className="memory-content">
              <span>MEMORY TRICK</span>

              <h4>{response.mnemonic}</h4>

              <p>
                A quick recall hook generated to help
                you remember the concept.
              </p>
            </div>

            <button className="memory-save">
              <span>＋</span>
              Save
            </button>

          </div>

          {/* Actions */}
          <div className="dr-actions">

            <button className="dr-secondary-action">
              <span>↻</span>
              Explain Again
            </button>

            <button className="dr-secondary-action">
              <span>✦</span>
              Create Memory Trick
            </button>

            <button className="dr-primary-action">
              Give Me Another Question
              <span>→</span>
            </button>

          </div>

        </div>

        {/* Feature Cards */}
        <div className="dr-feature-grid">

          <div className="dr-feature-card">
            <div className="dr-feature-icon purple">
              ?
            </div>

            <div>
              <span>UNDERSTAND</span>
              <h3>Know why you were wrong.</h3>
              <p>
                Get explanations based on your exact
                mistake, not just the correct answer.
              </p>
            </div>

            <div className="feature-arrow">↗</div>
          </div>

          <div className="dr-feature-card">
            <div className="dr-feature-icon blue">
              ✦
            </div>

            <div>
              <span>REMEMBER</span>
              <h3>Build memory tricks.</h3>
              <p>
                Turn difficult concepts into simple
                recall hooks you can actually remember.
              </p>
            </div>

            <div className="feature-arrow">↗</div>
          </div>

          <div className="dr-feature-card">
            <div className="dr-feature-icon green">
              ↗
            </div>

            <div>
              <span>ADAPT</span>
              <h3>Learn from your patterns.</h3>
              <p>
                Recalldose can spot repeated mistakes
                and guide your next practice session.
              </p>
            </div>

            <div className="feature-arrow">↗</div>
          </div>

          <div className="dr-feature-card">
            <div className="dr-feature-icon orange">
              ⚡
            </div>

            <div>
              <span>PRACTICE</span>
              <h3>Never stop at one question.</h3>
              <p>
                Ask Dr. Recall for another question
                whenever you're ready to test yourself.
              </p>
            </div>

            <div className="feature-arrow">↗</div>
          </div>

        </div>

        {/* Bottom */}
        <div className="dr-recall-bottom">
          <span>More than an AI chatbot.</span>
          <strong>A smarter way to recall.</strong>
        </div>

      </div>
    </section>
  );
};

export default DrRecall;