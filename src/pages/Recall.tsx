import { BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";

const Recall = () => {
  return (
    <div className="feature-page">
      <div className="feature-page-inner">
        <Link to="/dashboard" className="feature-back">
          ← Back to Dashboard
        </Link>

        <div className="feature-header">
          <span className="feature-eyebrow">RECALL ENGINE</span>

          <h1>
            Let's see what
            <br />
            you really remember.
          </h1>

          <p>
            Your Recall Engine will test your memory, understand your
            mistakes, and learn what you need to review next.
          </p>
        </div>

        <div className="recall-start-card">
          <div>
            <span className="feature-card-label">TODAY'S SESSION</span>

            <h2>Your personalized recall is ready.</h2>

            <p>
              This session will contain questions selected based on your
              current learning progress.
            </p>

            <Link
              to="/recall/session"
              className="feature-primary-button"
            >
              Start Session →
            </Link>
          </div>

          <div className="feature-card-visual">
            <span><BrainCircuit size={25} strokeWidth={1.7} aria-hidden="true" /></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recall;