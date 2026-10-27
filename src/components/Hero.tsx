const Hero = () => {
  return (
    <section className="hero">

      <div className="hero-glow hero-glow-purple"></div>
      <div className="hero-glow hero-glow-blue"></div>

      <div className="hero-content">

        <span className="hero-eyebrow">
          YOUR DAILY DOSE OF MEDICAL RECALL
        </span>

        <h1>
          Hey, future doctor.
          <span>🩺</span>
        </h1>

        <p className="hero-description">
          Medicine is a lot to remember.
          <br />
          We're here to make remembering it a little easier.
        </p>

        <div className="hero-flow">
          <span>Learn</span>
          <span className="arrow">→</span>
          <span>Recall</span>
          <span className="arrow">→</span>
          <span>Practice</span>
          <span className="arrow">→</span>
          <span>Master</span>
        </div>

        <div className="hero-actions">

          <a href="/register" className="primary-button">
            Start Your Journey
            <span>→</span>
          </a>

          <p>
            Already have an account?
            <a href="/login"> Log in</a>
          </p>

        </div>

      </div>

      <div className="hero-visual">

        <div className="orbit orbit-one"></div>
        <div className="orbit orbit-two"></div>

        <div className="recall-core">
          <span>💊</span>
          <strong>RECALL</strong>
        </div>

        <div className="floating-card card-drug">
          <small>DRUG</small>
          <strong>Mechanism</strong>
        </div>

        <div className="floating-card card-case">
          <small>CASE</small>
          <strong>Clinical</strong>
        </div>

        <div className="floating-card card-mcq">
          <small>MCQ</small>
          <strong>Practice</strong>
        </div>

      </div>

    </section>
  );
};

export default Hero;