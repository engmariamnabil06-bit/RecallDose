import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrors({});

    const newErrors: Record<string, string> = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        apiUrl("/api/auth/login"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-stars" aria-hidden="true">
        <span className="star star-1">✦</span>
        <span className="star star-2">·</span>
        <span className="star star-3">✦</span>
        <span className="star star-4">·</span>
        <span className="star star-5">✧</span>
        <span className="star star-6">·</span>
        <span className="star star-7">✦</span>
        <span className="star star-8">·</span>
        <span className="star star-9">✧</span>
        <span className="star star-10">·</span>
        <span className="star star-11">✦</span>
        <span className="star star-12">·</span>
      </div>

      <div className="auth-glow auth-glow-purple"></div>
      <div className="auth-glow auth-glow-blue"></div>

      <div className="auth-container">

        <Link to="/" className="auth-logo">
          <span className="auth-logo-mark">R</span>
          <span>RECALLDOSE</span>
        </Link>

        <div className="auth-card">

          <div className="auth-welcome">
            <span className="welcome-spark">✦</span>

            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h1>
              Hey, future doctor.
              <span>🩺</span>
            </h1>

            <p>
              Ready for your next recall?
            </p>
          </div>

          <div className="auth-header">
            <h2>
              Continue your
              <span>medical journey.</span>
            </h2>

            <p>
              Log in to keep building stronger
              memory, track your progress, and
              master what you learn.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >

            <div className="form-group">
              <label htmlFor="loginEmail">
                Email address
              </label>

              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fa-regular fa-envelope"></i>
                </span>

                <input
                  id="loginEmail"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {errors.email && (
                <small className="form-error">
                  {errors.email}
                </small>
              )}
            </div>

            <div className="form-group">

              <div className="password-label">
                <label htmlFor="loginPassword">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="input-wrapper">
                <span className="input-icon">
                  <i className="fa-solid fa-lock"></i>
                </span>

                <input
                  id="loginPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={isLoading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <i
                    className={
                      showPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye"
                    }
                  ></i>
                </button>
              </div>

              {errors.password && (
                <small className="form-error">
                  {errors.password}
                </small>
              )}
            </div>

            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                disabled={isLoading}
              />

              <span>Remember me</span>
            </label>

            {errors.general && (
              <div className="form-error">
                <i className="fa-solid fa-circle-exclamation"></i>

                <span>{errors.general}</span>
              </div>
            )}

            <button
              type="submit"
              className="auth-primary-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Logging in...
                  <span className="auth-spinner"></span>
                </>
              ) : (
                <>
                  Log in
                  <span>→</span>
                </>
              )}
            </button>

          </form>

          <div className="auth-divider">
            <span></span>
            <small>OR</small>
            <span></span>
          </div>

          <div className="auth-switch">
            Don't have an account?

            <Link to="/register">
              Create one
            </Link>
          </div>

        </div>

        <div className="auth-creator">
          <span>
            Created with curiosity by
          </span>

          <a
            href="https://mariam-nabil.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mariam Nabil
          </a>
        </div>

        <p className="auth-footer">
          Your daily dose of medical recall.
        </p>

      </div>
    </div>
  );
};

export default Login;