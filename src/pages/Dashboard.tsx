import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";
import {
  Brain,
  Bot,
  BookOpenCheck,
  ChartNoAxesCombined,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Crosshair,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Pill,
  Settings,
  Target,
  TrendingUp,
  UserRound,
  ArrowRight,
  AlertCircle,
  XCircle,
  Sparkles,
  LogOut,
} from "lucide-react";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
};

type DashboardStats = {
  recallStrength: number;
  questionsRecalled: number;
  correctAnswers: number;
  wrongAnswers: number;
  weakSpots: number;
  dayStreak: number;
};

type DashboardMistake = {
  id: string;
  questionId: string;
  type: string;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  reviewCount: number;
  resolved: boolean;
  createdAt: string;
};

type DashboardSubject = {
  subject: string;
  questionsSolved: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
};

type DashboardData = {
  stats: DashboardStats;
  mistakes: DashboardMistake[];
  subjects: DashboardSubject[];
  weakestSubject: DashboardSubject | null;
  sessions: {
    total: number;
    completed: number;
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [dashboardError, setDashboardError] =
    useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const response = await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Could not sign out. Please try again.");
      }
    } catch (error) {
      console.error("SIGN OUT ERROR:", error);
      setDashboardError(error instanceof Error ? error.message : "Could not sign out.");
      setIsSigningOut(false);
      return;
    }
    navigate("/login", { replace: true });
    setIsSigningOut(false);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setDashboardError(null);

        const userResponse = await fetch(
          apiUrl("/api/auth/me"),
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!userResponse.ok) {
          throw new Error("Unable to load user.");
        }

        const userData = await userResponse.json();

        setUser(userData.user);

        const dashboardResponse = await fetch(
          apiUrl("/api/dashboard"),
          {
            method: "GET",
            credentials: "include",
          }
        );

        const dashboardData =
          await dashboardResponse.json();

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardData.message ||
              "Unable to load dashboard data."
          );
        }

        setDashboard(dashboardData);
      } catch (error) {
        console.error(
          "DASHBOARD ERROR:",
          error
        );

        setDashboardError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loader-logo">
          R
        </div>

        <p>
          Preparing your recall space...
        </p>
      </div>
    );
  }

  if (!user || !dashboard) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loader-logo">
          R
        </div>

        <p>
          {dashboardError ||
            "Unable to load your dashboard."}
        </p>

        <Link to="/login">
          Back to Login
        </Link>
      </div>
    );
  }

  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  const stats = dashboard.stats;

  const hasMistakes =
    dashboard.mistakes.length > 0;

  const hasWeakSubject =
    dashboard.weakestSubject !== null;

  return (
    <div className="dashboard-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">

        <Link
          to="/dashboard"
          className="dashboard-brand"
        >
          <span className="dashboard-brand-mark">
            R
          </span>

          <span>RECALLDOSE</span>
        </Link>

        <nav className="dashboard-nav">

          <Link
            to="/dashboard"
            className="dashboard-nav-item active"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/recall"
            className="dashboard-nav-item"
          >
            <Brain size={18} />
            <span>Recall Engine</span>
          </Link>

          <Link
            to="/pharma-memory"
            className="dashboard-nav-item"
          >
            <Pill size={18} />
            <span>Pharma Memory Lab</span>
          </Link>

          <Link
            to="/daily-dose"
            className="dashboard-nav-item"
          >
            <Pill size={18} />
            <span>Daily Dose</span>
          </Link>

          <Link
            to="/weak-spots"
            className="dashboard-nav-item"
          >
            <Target size={18} />
            <span>Weak Spots</span>
          </Link>

          <Link
            to="/exams"
            className="dashboard-nav-item"
          >
            <ClipboardCheck size={18} />
            <span>Exam Simulator</span>
          </Link>

          <Link
            to="/mistakes"
            className="dashboard-nav-item"
          >
            <BookOpenCheck size={18} />
            <span>Mistake Bank</span>
          </Link>

          <Link
            to="/progress"
            className="dashboard-nav-item"
          >
            <ChartNoAxesCombined size={18} />
            <span>Progress</span>
          </Link>

          <Link
            to="/dr-recall"
            className="dashboard-nav-item"
          >
            <Bot size={18} />
            <span>Dr. Recall</span>
          </Link>

        </nav>

        <div className="dashboard-sidebar-bottom">

          <Link
            to="/profile"
            className="dashboard-nav-item"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>

          <button
            type="button"
            className="dashboard-nav-item dashboard-signout-button"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut size={18} />
            <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
          </button>

          <Link
            to="/profile"
            className="dashboard-profile-mini"
          >
            <div className="dashboard-avatar">
              {initials}
            </div>

            <div>
              <strong>
                Dr. {user.firstName}
              </strong>

              <small>
                View profile
              </small>
            </div>

            <UserRound size={15} />
          </Link>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="dashboard-content">

        {/* MOBILE HEADER */}

        <header className="dashboard-mobile-header">

          <Link
            to="/dashboard"
            className="dashboard-brand"
          >
            <span className="dashboard-brand-mark">
              R
            </span>

            <span>RECALLDOSE</span>
          </Link>

          <Link
            to="/profile"
            className="dashboard-avatar"
          >
            {initials}
          </Link>

        </header>

        {/* ================= WELCOME ================= */}

        <section className="dashboard-welcome">

          <div>

            <span className="dashboard-eyebrow">
              YOUR RECALL SPACE
            </span>

            <h1>
              Hello, Dr. {user.firstName}
            </h1>

            <p>
              Welcome back. Let's strengthen
              what you know today.
            </p>

          </div>

          <Link
            to="/profile"
            className="dashboard-avatar dashboard-avatar-large"
          >
            {initials}
          </Link>

        </section>

        {/* ================= TODAY'S RECALL ================= */}

        <section className="today-recall-card">

          <div className="today-recall-content">

            <span className="today-label">
              <TrendingUp size={14} />
              TODAY'S RECALL
            </span>

            <h2>
              Your memory is ready.
            </h2>

            <p>
              We've selected a short personalized
              session based on what you need to
              remember next.
            </p>

            <div className="today-meta">

              <span>
                <Brain size={15} />
                5 Questions
              </span>

              <span>
                <Clock3 size={15} />
                ~4 min
              </span>

              <span>
                <Crosshair size={15} />
                3 Topics
              </span>

            </div>

            <Link
              to="/recall"
              className="start-recall-button"
            >
              Start Recall
              <ArrowRight size={17} />
            </Link>

          </div>

          <div className="recall-visual">

            <div className="recall-orbit orbit-one"></div>

            <div className="recall-orbit orbit-two"></div>

            <div className="recall-brain">
              <Brain
                size={72}
                strokeWidth={1.2}
              />
            </div>

          </div>

        </section>

        {/* ================= STATS ================= */}

        <section className="dashboard-stats">

          <Link
            to="/progress"
            className="dashboard-stat-card"
          >
            <span className="stat-label">
              RECALL STRENGTH
            </span>

            <strong>
              {stats.recallStrength}%
            </strong>

            <span className="stat-description">
              Your current memory level
            </span>

            <div className="stat-progress">
              <span
                style={{
                  width: `${stats.recallStrength}%`,
                }}
              />
            </div>
          </Link>

          <Link
            to="/progress"
            className="dashboard-stat-card"
          >
            <span className="stat-label">
              DAY STREAK
            </span>

            <strong>
              {stats.dayStreak}
            </strong>

            <span className="stat-description">
              Days in a row
            </span>

            <div className="stat-mini-line"></div>
          </Link>

          <Link
            to="/progress"
            className="dashboard-stat-card"
          >
            <span className="stat-label">
              QUESTIONS RECALLED
            </span>

            <strong>
              {stats.questionsRecalled}
            </strong>

            <span className="stat-description">
              Questions completed
            </span>

            <div className="stat-mini-line"></div>
          </Link>

          <Link
            to="/weak-spots"
            className="dashboard-stat-card"
          >
            <span className="stat-label">
              WEAK SPOTS
            </span>

            <strong>
              {stats.weakSpots}
            </strong>

            <span className="stat-description">
              Topics need attention
            </span>

            <div className="stat-mini-line"></div>
          </Link>

        </section>

        {/* ================= LOWER GRID ================= */}

        <section className="dashboard-lower-grid">

          {/* ================= WEAK SPOTS ================= */}

          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <span className="panel-eyebrow">
                  MEMORY MAP
                </span>

                <h2>
                  Your weak spots
                </h2>
              </div>

              <Link to="/weak-spots">
                View all
                <ArrowRight size={15} />
              </Link>

            </div>

            {!hasWeakSubject ? (
              <div className="empty-panel">

                <div className="empty-panel-icon">
                  <Gauge size={30} />
                </div>

                <h3>
                  Your map is still forming
                </h3>

                <p>
                  Complete a few recall sessions
                  and we'll start identifying the
                  topics that need your attention.
                </p>

                <Link to="/recall">
                  Start building your map
                  <ArrowRight size={15} />
                </Link>

              </div>
            ) : (
              <div className="dashboard-real-content">

                {dashboard.weakestSubject && (
                  <>
                    <div className="dashboard-topic-row">

                      <div className="topic-title">

                        <div className="topic-icon">
                          <Target size={17} />
                        </div>

                        <div>
                          <strong>
                            {dashboard.weakestSubject.subject}
                          </strong>

                          <small>
                            {dashboard.weakestSubject.questionsSolved}{" "}
                            questions answered
                          </small>
                        </div>

                      </div>

                      <strong>
                        {dashboard.weakestSubject.accuracy}%
                      </strong>

                    </div>

                    <div className="stat-progress">
                      <span
                        style={{
                          width: `${dashboard.weakestSubject.accuracy}%`,
                        }}
                      />
                    </div>

                    <p>
                      This is currently your weakest
                      tracked subject. More recall data
                      will make this map more precise.
                    </p>
                  </>
                )}

              </div>
            )}

          </div>

          {/* ================= MISTAKE INTELLIGENCE ================= */}

          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <span className="panel-eyebrow">
                  MISTAKE INTELLIGENCE
                </span>

                <h2>
                  Recent mistakes
                </h2>
              </div>

              <Link to="/mistakes">
                View all
                <ArrowRight size={15} />
              </Link>

            </div>

            {!hasMistakes ? (
              <div className="empty-panel">

                <div className="empty-panel-icon">
                  <Lightbulb size={30} />
                </div>

                <h3>
                  No mistakes yet
                </h3>

                <p>
                  That's okay. Every wrong answer
                  will become useful data for your
                  Recall Engine.
                </p>

                <Link to="/recall">
                  Take your first recall
                  <ArrowRight size={15} />
                </Link>

              </div>
            ) : (
              <div className="dashboard-mistakes-list">

                {dashboard.mistakes.map(
                  (mistake) => {

                    const isSkipped =
                      mistake.type ===
                      "SKIPPED";

                    return (
                      <div
                        key={mistake.id}
                        className="dashboard-mistake-item"
                      >

                        <div className="mistake-icon">
                          {isSkipped ? (
                            <AlertCircle
                              size={18}
                            />
                          ) : (
                            <XCircle
                              size={18}
                            />
                          )}
                        </div>

                        <div className="mistake-content">

                          <div className="mistake-heading">

                            <strong>
                              {isSkipped
                                ? "Skipped question"
                                : "Wrong answer"}
                            </strong>

                            <span>
                              {mistake.reviewCount > 0
                                ? `${mistake.reviewCount} reviews`
                                : "Needs review"}
                            </span>

                          </div>

                          <small>
                            {mistake.selectedAnswer
                              ? `You chose: ${mistake.selectedAnswer}`
                              : "No answer selected"}
                          </small>

                          {mistake.correctAnswer && (
                            <small className="mistake-correct">
                              Correct answer:{" "}
                              {mistake.correctAnswer}
                            </small>
                          )}

                        </div>

                        <Link
                          to="/recall"
                          className="mistake-review-button"
                        >
                          Review
                          <ArrowRight size={14} />
                        </Link>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="quick-actions">

          <div className="panel-header">

            <div>
              <span className="panel-eyebrow">
                KEEP GOING
              </span>

              <h2>
                Quick actions
              </h2>
            </div>

            <Sparkles size={18} />

          </div>

          <div className="quick-actions-grid">

            <Link
              to="/daily-dose"
              className="quick-action"
            >
              <Pill size={22} />

              <div>
                <strong>
                  Daily Dose
                </strong>

                <small>
                  Your 5-minute challenge
                </small>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/exams"
              className="quick-action"
            >
              <ClipboardCheck size={22} />

              <div>
                <strong>
                  Exam Simulator
                </strong>

                <small>
                  Practice like exam day
                </small>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/dr-recall"
              className="quick-action"
            >
              <Bot size={22} />

              <div>
                <strong>
                  Ask Dr. Recall
                </strong>

                <small>
                  Understand your mistakes
                </small>
              </div>

              <ArrowRight size={18} />
            </Link>

          </div>

        </section>

      </main>

    </div>
  );
};

export default Dashboard;



