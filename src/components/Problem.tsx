import { useEffect, useRef, useState, type ComponentType } from "react";
import { Pill, BrainCircuit, Infinity as InfinityIcon } from "lucide-react";

type StatCardProps = {
  value: number;
  suffix: string;
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
  delay: number;
};

const StatCard = ({
  value,
  suffix,
  label,
  description,
  icon: Icon,
  delay,
}: StatCardProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cardRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }

    const duration = 3200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      const currentValue = Math.floor(
        easedProgress * value
      );

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, value, delay]);

  return (
    <div
      ref={cardRef}
      className={`problem-stat ${
        isVisible ? "stat-visible" : ""
      }`}
    >
      <div className="stat-icon">
        <Icon size={25} strokeWidth={1.7} aria-hidden={true} />
      </div>

      <strong>
        {count.toLocaleString()}
        {suffix}
      </strong>

      <span className="stat-label">
        {label}
      </span>

      <p>{description}</p>

      <div className="stat-glow"></div>
      <div className="stat-line"></div>
    </div>
  );
};


const Problem = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const [sectionVisible, setSectionVisible] =
    useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionVisible(entry.isIntersecting);
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
      className={`problem-section ${
        sectionVisible ? "section-visible" : ""
      }`}
      id="features"
    >
      <div className="problem-container">

        {/* =========================
            SECTION HEADING
        ========================= */}

        <div className="problem-heading">

          <span className="section-eyebrow">
            THE PROBLEM
          </span>

          <h2>
            Medicine is a lot
            <span>to remember.</span>
          </h2>

          <p>
            You study it once.
            Then twice.
            Then somehow forget it right before the exam.
          </p>

        </div>


        {/* =========================
            STAT CARDS
        ========================= */}

        <div className="problem-stats">

          <StatCard
            value={100}
            suffix="+"
            label="Drugs to remember"
            description="Names, mechanisms, indications, side effects..."
            icon={Pill}
            delay={0}
          />


          <StatCard
            value={1000}
            suffix="+"
            label="Facts to connect"
            description="Concepts that only make sense when they connect."
            icon={BrainCircuit}
            delay={150}
          />


          {/* =========================
              INFINITY CARD
          ========================= */}

          <div
            className={`problem-stat infinity-card ${
              sectionVisible ? "stat-visible" : ""
            }`}
          >

            <div className="stat-icon infinity-icon" aria-hidden="true">
              <InfinityIcon size={27} strokeWidth={1.8} />
            </div>

            <strong className="infinity-symbol">
              ∞
            </strong>

            <span className="stat-label">
              Questions to practice
            </span>

            <p>
              Because knowing something isn't
              the same as recalling it.
            </p>

            <div className="infinity-orbit orbit-small"></div>

            <div className="infinity-orbit orbit-large"></div>

            <div className="stat-glow"></div>

            <div className="stat-line"></div>

          </div>

        </div>


        {/* =========================
            TRANSITION
        ========================= */}

        <div className="problem-transition">

          <span>
            So we built
          </span>

          <strong>
            a better way to remember.
          </strong>

        </div>

      </div>
    </section>
  );
};

export default Problem;