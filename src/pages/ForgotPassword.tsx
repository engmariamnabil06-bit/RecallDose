const ForgotPassword = () => {
  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-purple"></div>
      <div className="auth-glow auth-glow-blue"></div>

      <div className="auth-container">

        <a href="/" className="auth-logo">
          <span className="auth-logo-mark">R</span>
          <span>RECALLDOSE</span>
        </a>

        <div className="auth-card forgot-card">

          <div className="forgot-icon">
            ✦
          </div>

          <div className="auth-header">
            <span className="auth-eyebrow">
              RESET PASSWORD
            </span>

            <h1>
              Forgot your
              <span>password?</span>
            </h1>

            <p>
              No worries. Enter your email and we'll
              help you get back to your recall journey.
            </p>
          </div>

          <form className="auth-form">

            <div className="form-group">
              <label htmlFor="forgotEmail">
                Email address
              </label>

              <input
                id="forgotEmail"
                type="email"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              className="auth-primary-button"
            >
              Send Reset Link
              <span>→</span>
            </button>

          </form>

          <div className="auth-switch">
            Remember your password?
            <a href="/login">
              Back to login
            </a>
          </div>

        </div>

        <p className="auth-footer">
          Your daily dose of medical recall.
        </p>

      </div>
    </div>
  );
};

export default ForgotPassword;