import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [developmentResetUrl, setDevelopmentResetUrl] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    setDevelopmentResetUrl("");

    try {
      const response = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not request a password reset.");
      setMessage(payload.message || "Check your inbox for password recovery instructions.");
      if (typeof payload.developmentResetUrl === "string") {
        setDevelopmentResetUrl(payload.developmentResetUrl);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-purple"></div>
      <div className="auth-glow auth-glow-blue"></div>
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-mark">R</span>
          <span>RECALLDOSE</span>
        </Link>

        <section className="auth-card forgot-card">
          <div className="forgot-icon" aria-hidden="true">✦</div>
          <header className="auth-header">
            <span className="auth-eyebrow">ACCOUNT RECOVERY</span>
            <h1>Forgot your <span>password?</span></h1>
            <p>Enter the email address linked to your account. We’ll send a secure reset link if an account matches.</p>
          </header>

          <form className="auth-form" onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="forgotEmail">Email address</label>
              <input
                id="forgotEmail"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy}
              />
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}
            {message && <p className="form-success" role="status">{message}</p>}
            {developmentResetUrl && (
              <div className="dev-reset-link">
                <strong>Local development link</strong>
                <p>Email delivery is not configured in development. Open this one-time link to test the reset flow:</p>
                <a href={developmentResetUrl}>Open password reset page</a>
              </div>
            )}

            <button type="submit" className="auth-primary-button" disabled={busy || !email.trim()}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>

          <div className="auth-switch">
            Remember your password? <Link to="/login">Back to login</Link>
          </div>
        </section>

        <p className="auth-footer">Your daily dose of medical recall.</p>
      </div>
    </div>
  );
}
