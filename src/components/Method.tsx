import { useEffect, useRef, useState } from "react";
import { BookOpen, BrainCircuit, Target, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Learn",
    description:
      "Understand the drug, mechanism, indications, and the clinical logic behind it.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Recall",
    description:
      "Close the notes and challenge your memory. Can you bring the information back?",
    icon: BrainCircuit,
  },
  {
    number: "03",
    title: "Practice",
    description:
      "Test yourself with MCQs, clinical cases, and exam-style questions.",
    icon: Target,
  },
  {
    number: "04",
    title: "Master",
    description:
      "Track your mistakes, strengthen weak areas, and turn knowledge into confidence.",
    icon: Trophy,
  },
];

const Method = () => {
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
      className={`method-section ${
        isVisible ? "method-visible" : ""
      }`}
      id="how-it-works"
    >
      <div className="method-container">

        {/* =========================
            HEADING
        ========================= */}

        <div className="method-heading">

          <span className="section-eyebrow">
            THE RECALLDOSE METHOD
          </span>

          <h2>
            A smarter way
            <span>to remember medicine.</span>
          </h2>

          <p>
            Don't just study more.
            Study in a way that makes information stick.
          </p>

        </div>


        {/* =========================
            JOURNEY
        ========================= */}

        <div className="method-journey">

          <div className="method-line">

            <div className="method-line-progress"></div>

          </div>


          {steps.map((step, index) => (
            <div
              className="method-step"
              key={step.number}
              style={{
                transitionDelay: `${0.25 + index * 0.2}s`,
              }}
            >

              {/* NUMBER */}

              <div className="method-number">
                {step.number}
              </div>


              {/* ICON */}

              <div className="method-icon">
                <step.icon size={23} strokeWidth={1.7} aria-hidden="true" />
              </div>


              {/* CONTENT */}

              <div className="method-content">

                <h3>
                  {step.title}
                </h3>

                <p>
                  {step.description}
                </p>

              </div>

            </div>
          ))}

        </div>


        {/* =========================
            BOTTOM MESSAGE
        ========================= */}

        <div className="method-bottom">

          <span>
            Less passive studying.
          </span>

          <strong>
            More active recall.
          </strong>

        </div>

      </div>
    </section>
  );
};

export default Method;