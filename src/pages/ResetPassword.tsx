import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This password reset link is missing or invalid. Request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      setError("Please use a password of 72 UTF-8 bytes or fewer.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "This reset link is invalid or has expired.");
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reset your password. Please try again.");
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
            <span className="auth-eyebrow">SECURE ACCOUNT RECOVERY</span>
            <h1>Choose a new <span>password.</span></h1>
            <p>Use at least 8 characters. This reset link expires after 30 minutes and works only once.</p>
          </header>

          {!token ? (
            <div className="auth-form">
              <p className="form-error" role="alert">This password reset link is missing or invalid.</p>
              <Link to="/forgot-password" className="auth-primary-button">Request a new link</Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm new password</label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={busy}
                />
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="auth-primary-button" disabled={busy}>
                {busy ? "Updating password…" : "Update password"}
              </button>
            </form>
          )}

          <div className="auth-switch">
            <Link to="/login">Back to login</Link>
          </div>
        </section>
        <p className="auth-footer">Your daily dose of medical recall.</p>
      </div>
    </div>
  );
}
