import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  CalendarClock,
  LogOut,
  Target,
  TrendingUp,
} from "lucide-react";
import { apiUrl } from "../lib/api";

type SubjectSummary = {
  subject: string;
  questionsSolved: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
};

type WeakSpot = {
  id: string;
  subject: string;
  topic: string;
  accuracy: number;
  mistakeCount: number;
  priority: number;
};

type Mistake = {
  id: string;
  questionId: string;
  questionText: string;
  explanation: string | null;
  type: string;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  reviewCount: number;
  resolved: boolean;
  createdAt: string;
};

type DashboardPayload = {
  stats: {
    recallStrength: number;
    questionsRecalled: number;
    correctAnswers: number;
    wrongAnswers: number;
    weakSpots: number;
    dayStreak: number;
  };
  subjects: SubjectSummary[];
  weakSpots: WeakSpot[];
  allMistakes: Mistake[];
  sessions: { total: number; completed: number };
};

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
};

type DailyDose = {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  subject: string | null;
  topic: string | null;
  targetCount: number | null;
  completedCount: number;
  scheduledDate: string;
};

type RecallTwin = {
  overview: {
    totalQuestions: number;
    totalCorrect: number;
    totalWrong: number;
    overallAccuracy: number;
  };
  knowledgeStates: {
    mastered: number;
    stable: number;
    struggling: number;
    critical: number;
  };
  strongestAreas: Array<{
    subject: string;
    topic: string | null;
    accuracy: number;
    knowledgeState: string;
  }>;
  weakestAreas: Array<{
    subject: string;
    topic: string;
    accuracy: number;
    mistakeCount: number;
    priority: number;
    knowledgeState: string;
  }>;
  riskAreas: Array<{ subject: string; topic: string | null; accuracy: number; questionsSolved: number; mistakeCount: number; knowledgeState: string; daysSinceActivity: number; riskScore: number; reason: string; nextAction: string }>;
  nextActions: Array<{ subject: string; topic: string | null; riskScore: number; reason: string; action: string; daysSinceActivity: number }>;
  generatedAt: string;
  methodology: string;
  unresolvedMistakes: number;
  weakSpotCount: number;
};

function useApiData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(apiUrl(path), {
          credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message || "Could not load this page.");
        }

        if (!cancelled) setData(payload as T);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, loading, error };
}

function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="insight-page">
      <div className="insight-page-inner">
        <Link to="/dashboard" className="feature-back">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <header className="insight-page-heading">
          <span className="feature-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </div>
    </main>
  );
}

function LoadState({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) {
    return <div className="insight-state" role="status">Loading your learning data…</div>;
  }
  if (error) {
    return (
      <div className="insight-state insight-state-error" role="alert">
        <p>{error}</p>
        <Link to="/login" className="feature-primary-button">Return to login</Link>
      </div>
    );
  }
  return null;
}

export function ProgressPage() {
  const { data, loading, error } = useApiData<DashboardPayload>("/api/dashboard");

  return (
    <PageShell
      eyebrow="YOUR PROGRESS"
      title="Evidence of what you remember."
      description="These figures come from your saved recall answers, not demo counters."
    >
      <LoadState loading={loading} error={error} />
      {data && (
        <>
          <section className="insight-stat-grid">
            <article className="insight-stat"><span>Recall accuracy</span><strong>{data.stats.recallStrength}%</strong><small>{data.stats.correctAnswers} correct answers</small></article>
            <article className="insight-stat"><span>Questions answered</span><strong>{data.stats.questionsRecalled}</strong><small>Across all recorded topics</small></article>
            <article className="insight-stat"><span>Sessions completed</span><strong>{data.sessions.completed}</strong><small>{data.sessions.total} total sessions</small></article>
            <article className="insight-stat"><span>Active weak spots</span><strong>{data.stats.weakSpots}</strong><small>Topics to revisit</small></article>
          </section>
          <section className="insight-panel">
            <div className="insight-panel-title"><TrendingUp size={19} /><h2>Subject performance</h2></div>
            {data.subjects.length === 0 ? (
              <p className="insight-empty">Your subject report will appear after you answer your first recall question.</p>
            ) : data.subjects.map((subject) => (
              <div className="insight-subject" key={subject.subject}>
                <div className="insight-subject-top"><strong>{subject.subject}</strong><span>{subject.accuracy}% accuracy · {subject.questionsSolved} answered</span></div>
                <div className="insight-meter"><span style={{ width: `${subject.accuracy}%` }} /></div>
              </div>
            ))}
          </section>
          <p className="insight-note">A daily streak is not shown yet because the current data model does not retain a complete day-by-day activity history.</p>
        </>
      )}
    </PageShell>
  );
}

export function WeakSpotsPage() {
  const { data, loading, error } = useApiData<DashboardPayload>("/api/dashboard");

  return (
    <PageShell
      eyebrow="MEMORY MAP"
      title="Topics that need another pass."
      description="Weak spots are based on your recorded accuracy and repeated wrong answers."
    >
      <LoadState loading={loading} error={error} />
      {data && (
        <section className="insight-panel">
          <div className="insight-panel-title"><Target size={19} /><h2>Active weak spots</h2></div>
          {data.weakSpots.length === 0 ? (
            <div className="insight-empty">
              <CheckCircle2 size={24} />
              <p>No active weak spots yet. Answer more questions and this list will build from your results.</p>
            </div>
          ) : data.weakSpots.map((spot) => (
            <article className="insight-weakspot" key={spot.id}>
              <div className="insight-weakspot-top">
                <div><strong>{spot.topic}</strong><span>{spot.subject}</span></div>
                <span className="insight-priority">Priority {spot.priority}/100</span>
              </div>
              <div className="insight-subject-top"><span>Accuracy</span><strong>{spot.accuracy}%</strong></div>
              <div className="insight-meter"><span style={{ width: `${Math.max(0, Math.min(100, spot.accuracy))}%` }} /></div>
              <small>{spot.mistakeCount} recorded wrong answers</small>
            </article>
          ))}
          <Link to="/recall" className="feature-primary-button">Practice recall <ArrowRight size={16} /></Link>
        </section>
      )}
    </PageShell>
  );
}

export function MistakesPage() {
  const { data, loading, error } = useApiData<DashboardPayload>("/api/dashboard");

  return (
    <PageShell
      eyebrow="MISTAKE BANK"
      title="Wrong answers worth revisiting."
      description="Your unresolved mistakes stay visible so you can revisit the underlying concept."
    >
      <LoadState loading={loading} error={error} />
      {data && (
        <section className="insight-mistake-list">
          {data.allMistakes.length === 0 ? (
            <div className="insight-panel insight-empty">
              <CheckCircle2 size={24} />
              <p>No unresolved mistakes recorded. Your next recall session will help build this bank.</p>
            </div>
          ) : data.allMistakes.map((mistake) => (
            <article className="insight-panel insight-mistake" key={mistake.id}>
              <div className="insight-panel-title"><AlertTriangle size={18} /><span>{mistake.type.replaceAll("_", " ")}</span><small>{new Date(mistake.createdAt).toLocaleDateString()}</small></div>
              <h2>{mistake.questionText}</h2>
              {mistake.selectedAnswer && <p><strong>Your answer:</strong> {mistake.selectedAnswer}</p>}
              {mistake.correctAnswer && <p><strong>Correct answer:</strong> {mistake.correctAnswer}</p>}
              {mistake.explanation && <p className="insight-explanation">{mistake.explanation}</p>}
              <Link to="/ai-tutor" className="feature-primary-button" state={{
                mode: "subject-doctor",
                message: "Teach me this mistake like my personal subject lecturer. Help me understand the concept, not just memorize the answer. Then give me a new similar question without showing its answer first.",
                context: [
                  "MY SAVED MISTAKE",
                  `Question: ${mistake.questionText}`,
                  `My answer: ${mistake.selectedAnswer || "Not recorded"}`,
                  `Correct answer: ${mistake.correctAnswer || "Not recorded"}`,
                  `Existing explanation: ${mistake.explanation || "No explanation saved"}`,
                  "Please identify the misconception and teach the underlying topic step by step."
                ].join("\\n")
              }}>Study this with Dr. Subject <ArrowRight size={16}/></Link>
            </article>
          ))}
        </section>
      )}
    </PageShell>
  );
}

export function DailyDosePage() {
  const { data, loading, error } = useApiData<{ dose: DailyDose }>("/api/daily-dose");
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function startDose() {
    if (!data?.dose || starting) return;
    setStarting(true);
    setActionError(null);
    try {
      const response = await fetch(apiUrl(`/api/daily-dose/${data.dose.id}/start`), {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not start today's dose.");
      navigate(`/recall/session?dailyDoseId=${encodeURIComponent(data.dose.id)}`);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Could not start today's dose.");
      setStarting(false);
    }
  }

  return (
    <PageShell
      eyebrow="DAILY DOSE"
      title="A focused session for today."
      description="Your dose is selected from the learning data currently recorded for your account."
    >
      <LoadState loading={loading} error={error} />
      {data?.dose && (
        <section className="insight-panel insight-dose">
          <span className="feature-eyebrow">{data.dose.type.replaceAll("_", " ")}</span>
          <h2>{data.dose.title}</h2>
          <p>{data.dose.description || "A short session to keep your recall active."}</p>
          <div className="insight-dose-meta">
            <span><Target size={16} /> {data.dose.targetCount ?? 5} questions</span>
            {data.dose.subject && <span>{data.dose.subject}</span>}
            {data.dose.topic && <span>{data.dose.topic}</span>}
            <span><Clock3 size={16} /> {data.dose.status.replaceAll("_", " ")}</span>
          </div>
          {actionError && <p className="insight-error" role="alert">{actionError}</p>}
          {data.dose.status === "COMPLETED" ? (
            <p className="insight-success"><CheckCircle2 size={18} /> Today's dose is complete. Come back tomorrow for the next one.</p>
          ) : (
            <button type="button" className="feature-primary-button" onClick={startDose} disabled={starting}>
              {starting ? "Preparing session…" : data.dose.status === "IN_PROGRESS" ? "Continue today's dose" : "Start today's dose"}
              <ArrowRight size={16} />
            </button>
          )}
        </section>
      )}
    </PageShell>
  );
}

export function RecallTwinPage() {
  const { data, loading, error } = useApiData<RecallTwin>("/api/recall-twin");
  const aiContext = data ? JSON.stringify({
    overview: data.overview,
    knowledgeStates: data.knowledgeStates,
    strongestAreas: data.strongestAreas,
    priorityAreas: data.weakestAreas,
    riskAreas: data.riskAreas,
    nextActions: data.nextActions,
    unresolvedMistakes: data.unresolvedMistakes,
    methodology: data.methodology,
  }, null, 2) : "";

  return (
    <PageShell
      eyebrow="RECALL TWIN"
      title="A clearer picture of your recall."
      description="Your learning profile combines saved performance with transparent study-priority indicators. Ask AI to turn it into a personal action plan."
    >
      <LoadState loading={loading} error={error} />
      {data && (
        <>
          <section className="insight-stat-grid">
            <article className="insight-stat"><span>Overall accuracy</span><strong>{data.overview.overallAccuracy}%</strong><small>{data.overview.totalQuestions} answered</small></article>
            <article className="insight-stat"><span>Unresolved mistakes</span><strong>{data.unresolvedMistakes}</strong><small>Recorded wrong answers</small></article>
            <article className="insight-stat"><span>Active weak spots</span><strong>{data.weakSpotCount}</strong><small>Topics prioritized for review</small></article>
            <article className="insight-stat"><span>Current study state</span><strong>{data.knowledgeStates.mastered + data.knowledgeStates.stable}</strong><small>Mastered or stable areas</small></article>
          </section>
          <section className="insight-two-column">
            <div className="insight-panel">
              <div className="insight-panel-title"><Brain size={19}/><h2>Strongest areas</h2></div>
              {data.strongestAreas.length ? data.strongestAreas.map((area,index)=><div className="insight-compact-row" key={`${area.subject}-${area.topic}-${index}`}><div><strong>{area.topic||area.subject}</strong><span>{area.subject} · {area.knowledgeState.toLowerCase()}</span></div><b>{area.accuracy}%</b></div>) : <p className="insight-empty">Answer more questions to identify stable topics.</p>}
            </div>
            <div className="insight-panel">
              <div className="insight-panel-title"><AlertTriangle size={19}/><h2>Priority areas</h2></div>
              {data.weakestAreas.length ? data.weakestAreas.map((area,index)=><div className="insight-compact-row" key={`${area.subject}-${area.topic}-${index}`}><div><strong>{area.topic}</strong><span>{area.subject} · {area.mistakeCount} wrong · priority {area.priority}/100</span></div><b>{area.accuracy}%</b></div>) : <p className="insight-empty">No weak topics detected yet.</p>}
            </div>
          </section>
          <section className="insight-panel">
            <div className="insight-panel-title"><Target size={19}/><h2>Recall risk & next best actions</h2></div>
            {data.nextActions.length ? <div className="insight-review-list">{data.nextActions.map((item,index)=><article className="insight-review-item" key={`${item.subject}-${item.topic}-${index}`}><div className="insight-review-copy"><span className="feature-eyebrow">{item.subject} · priority indicator {item.riskScore}/100</span><h3>{item.topic||item.subject}</h3><p>{item.reason} · {item.daysSinceActivity} day(s) since last activity</p><p>{item.action}</p></div></article>)}</div> : <p className="insight-empty">Complete a few recall questions in each subject to build a useful topic history.</p>}
            <p className="insight-note">{data.methodology}</p>
          </section>
          <div className="insight-recall-actions">
            <Link to="/ai-tutor" state={{ mode: "recall-plan", context: aiContext }} className="feature-primary-button">Build my AI study plan <ArrowRight size={16}/></Link>
            <Link to="/recall" className="feature-secondary-button">Start a recall session <ArrowRight size={16}/></Link>
          </div>
        </>
      )}
    </PageShell>
  );
}

export function ProfilePage() {
  type ProfilePayload = {
    user: User;
    profile: { university: string; faculty: string; year: string; specialization: string };
  };
  const { data, loading, error } = useApiData<ProfilePayload>("/api/auth/profile");
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", university: "", faculty: "", year: "", specialization: "" });
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!data) return;
    setForm({
      firstName: data.user.firstName || "",
      lastName: data.user.lastName || "",
      university: data.profile.university || "",
      faculty: data.profile.faculty || "",
      year: data.profile.year || "",
      specialization: data.profile.specialization || "",
    });
  }, [data]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setMessage(""); setActionError("");
    try {
      const response = await fetch(apiUrl("/api/auth/profile"), {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not save your profile.");
      setMessage(payload.message || "Profile saved.");
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Could not save your profile.");
    } finally { setSaving(false); }
  }

  async function signOut() {
    setSigningOut(true); setActionError("");
    try {
      const response = await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      navigate("/login", { replace: true });
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Could not sign out.");
      setSigningOut(false);
    }
  }

  return (
    <PageShell eyebrow="YOUR ACCOUNT" title="Your learning profile." description="Keep your academic context current so your learning space can be organized around your program.">
      <LoadState loading={loading} error={error} />
      {data?.user && <>
        <form className="insight-panel insight-profile" onSubmit={(event) => void saveProfile(event)}>
          <div className="insight-profile-avatar">{`${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase()}</div>
          <div><h2>{form.firstName || data.user.firstName} {form.lastName || data.user.lastName}</h2><p>{data.user.email}</p></div>
          <div className="insight-profile-form">
            <label>First name<input required maxLength={80} value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}/></label>
            <label>Last name<input required maxLength={80} value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}/></label>
            <label>University / institution<input maxLength={160} value={form.university} onChange={(event) => setForm((current) => ({ ...current, university: event.target.value }))}/></label>
            <label>Faculty / program<input maxLength={160} value={form.faculty} onChange={(event) => setForm((current) => ({ ...current, faculty: event.target.value }))}/></label>
            <label>Academic year<input maxLength={160} value={form.year} onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}/></label>
            <label>Specialization<input maxLength={160} value={form.specialization} onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value }))}/></label>
          </div>
          <dl><div><dt>Account role</dt><dd>{data.user.role}</dd></div><div><dt>Email status</dt><dd>{data.user.emailVerified ? "Verified" : "Not verified"}</dd></div></dl>
          {message && <p className="insight-success" role="status">{message}</p>}
          {actionError && <p className="insight-error" role="alert">{actionError}</p>}
          <div className="insight-profile-actions"><button type="submit" className="feature-primary-button" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button><button type="button" className="feature-secondary-button" onClick={() => void signOut()} disabled={signingOut}><LogOut size={16}/>{signingOut ? "Signing out…" : "Sign out"}</button></div>
        </form>
        <p className="insight-note">Your login email is read-only here. Email verification and changing the account email need a separate verified-email workflow.</p>
      </>}
    </PageShell>
  );
}

export function ExamsPage() {
  type Exam = { id: string; title: string; description: string | null; subject: string | null; topic: string | null; durationMinutes: number | null };
  type ActiveAttempt = Exam & { attemptId: string; examId: string; startedAt: string; totalQuestions: number };
  type ExamQuestion = { id: string; text: string; subject: string | null; topic: string | null; selectedOptionId?: string | null; options: Array<{ id: string; text: string }> };
  type Result = { score: number; correctAnswers: number; wrongAnswers: number; skippedAnswers: number; totalQuestions: number; review?: Array<{questionId:string;text:string;subject:string|null;topic:string|null;explanation:string|null;selectedAnswer:string|null;correctAnswer:string|null;isCorrect:boolean;skipped:boolean;sourceTitle:string|null;sourceReference:string|null;reviewed:boolean}> };
  const [exams, setExams] = useState<Exam[]>([]);
  const [examHistory, setExamHistory] = useState<Array<{attemptId:string;title:string;subject:string|null;topic:string|null;score:number;correctAnswers:number;wrongAnswers:number;skippedAnswers:number;totalQuestions:number;completedAt:string}>>([]);
  const [examAnalytics, setExamAnalytics] = useState({totalExams:0,averageScore:0,bestScore:0});
  const [activeAttempts, setActiveAttempts] = useState<ActiveAttempt[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(apiUrl("/api/exams"), { credentials: "include" }).then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not load exams.");
      if (active) setExams(Array.isArray(payload.exams) ? payload.exams : []);
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load exams."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    fetch(apiUrl("/api/exams/active"), { credentials: "include" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "Could not load active exam attempts.");
        if (active) setActiveAttempts(Array.isArray(payload.attempts) ? payload.attempts : []);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load active exam attempts.");
      });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    fetch(apiUrl("/api/exams/history"), { credentials: "include" })
      .then(async response => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "Could not load exam analytics.");
        if (active) {
          setExamHistory(Array.isArray(payload.attempts) ? payload.attempts : []);
          setExamAnalytics(payload.analytics || { totalExams: 0, averageScore: 0, bestScore: 0 });
        }
      })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Could not load exam analytics."); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!startedAt || result) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, result]);

  const remainingSeconds = exam?.durationMinutes && startedAt
    ? Math.max(0, exam.durationMinutes * 60 - Math.floor((now - startedAt) / 1000)) : null;

  async function startExam(item: Exam) {
    setBusy(true); setError(null); setSuccess(null); setResult(null);
    try {
      const response = await fetch(apiUrl(`/api/exams/${item.id}/start`), { method: "POST", credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not start this exam.");
      setExam(item); setAttemptId(payload.attempt.id); setQuestions(payload.questions || []); setAnswers({});
      setStartedAt(new Date(payload.attempt.startedAt).getTime() || Date.now()); setNow(Date.now());
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start this exam."); }
    finally { setBusy(false); }
  }

  async function resumeAttempt(item: ActiveAttempt) {
    setBusy(true); setError(null); setSuccess(null); setResult(null);
    try {
      const response = await fetch(apiUrl(`/api/exams/${item.examId}/${item.attemptId}`), {
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not resume this exam.");
      const restoredQuestions: ExamQuestion[] = Array.isArray(payload.questions) ? payload.questions : [];
      const restoredAnswers = Object.fromEntries(
        restoredQuestions
          .filter((question) => Boolean(question.selectedOptionId))
          .map((question) => [question.id, question.selectedOptionId as string])
      );
      setExam(item);
      setAttemptId(item.attemptId);
      setQuestions(restoredQuestions);
      setAnswers(restoredAnswers);
      const parsedStart = Date.parse(payload.attempt?.startedAt || item.startedAt);
      setStartedAt(Number.isFinite(parsedStart) ? parsedStart : Date.now());
      setNow(Date.now());
      setSuccess("Your previous exam attempt has been restored.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not resume this exam.");
    } finally {
      setBusy(false);
    }
  }

  async function chooseAnswer(question: ExamQuestion, optionId: string) {
    if (!exam || !attemptId || answers[question.id] || busy || result) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch(apiUrl(`/api/exams/${exam.id}/answer`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId, questionId: question.id, selectedOptionId: optionId }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not save this answer.");
      setAnswers((current) => ({ ...current, [question.id]: optionId }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save this answer."); }
    finally { setBusy(false); }
  }

  async function finishExam() {
    if (!exam || !attemptId || busy || result) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch(apiUrl(`/api/exams/${exam.id}/${attemptId}/finish`), { method: "POST", credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not finish the exam.");
      setResult(payload.result); setSuccess("Your result has been saved.");
      setActiveAttempts((current) => current.filter((attempt) => attempt.attemptId !== attemptId));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not finish the exam."); }
    finally { setBusy(false); }
  }

  function leaveExam() { setExam(null); setAttemptId(null); setQuestions([]); setAnswers({}); setStartedAt(null); setResult(null); setError(null); setSuccess(null); }

  return (
    <PageShell eyebrow="EXAM SIMULATOR" title={result ? "Your exam result." : exam ? exam.title : "Practice under exam conditions."} description={exam ? "Answers are saved to your account as you select them. Submit when you are ready." : "Timed exams use published exam records and active questions in the database. No demo scores are shown."}>
      {error && <p className="insight-error" role="alert">{error}</p>}
      {success && <p className="insight-success" role="status">{success}</p>}
      {result ? <section className="insight-panel"><div className="insight-stat-grid"><article className="insight-stat"><span>Score</span><strong>{result.score}%</strong></article><article className="insight-stat"><span>Correct</span><strong>{result.correctAnswers}</strong></article><article className="insight-stat"><span>Incorrect</span><strong>{result.wrongAnswers}</strong></article><article className="insight-stat"><span>Skipped</span><strong>{result.skippedAnswers}</strong></article></div><p>Review every answer below. Incorrect and skipped questions are also added to your Smart Mistake Bank.</p>
      {result.review && <div className="insight-review-list">{result.review.map((item,index)=><article className="insight-panel" key={item.questionId}>
        <div className="insight-panel-title"><span>{index+1}. {item.topic || item.subject || "Question"}</span><small>{item.reviewed ? "Reviewed source" : "Source review not recorded"}</small></div>
        <h3>{item.text}</h3>
        <p><strong>Your answer:</strong> {item.selectedAnswer || "Skipped"}</p>
        <p><strong>Correct answer:</strong> {item.correctAnswer || "Not configured"}</p>
        {item.explanation && <p className="insight-explanation">{item.explanation}</p>}<p className="insight-note">{item.reviewed && item.sourceReference ? "Source-linked and reviewed by RecallDose." : "Source review details are not available for this question."}{item.sourceTitle ? ` Source: ${item.sourceTitle}.` : ""}{item.sourceReference ? ` Reference: ${item.sourceReference}` : ""}</p>
        <Link to="/ai-tutor" className="feature-secondary-button" state={{mode:"subject-doctor",message:"Teach me this exam mistake step by step, then test me with a similar question.",context:[`Question: ${item.text}`,`My answer: ${item.selectedAnswer || "Skipped"}`,`Correct answer: ${item.correctAnswer || "Not available"}`,`Explanation: ${item.explanation || "No explanation supplied"}`,`Subject: ${item.subject || "Not specified"}`,`Topic: ${item.topic || "Not specified"}`].join("\\n")}}>Review with Dr. Subject <ArrowRight size={16}/></Link>
      </article>)}</div>}
      <button type="button" className="feature-primary-button" onClick={leaveExam}>Back to exam list <ArrowRight size={16} /></button><Link to="/mistakes" className="feature-secondary-button">Review mistake bank</Link></section>
      : exam ? <section className="insight-panel"><div className="insight-dose-meta"><span><Clock3 size={16} /> {remainingSeconds === null ? "Untimed" : `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2,"0")} remaining`}</span><span>{Object.keys(answers).length}/{questions.length} answered</span></div>{remainingSeconds === 0 && <p className="insight-error">Time is up. Submit to calculate your score.</p>}{questions.map((question,index) => <article className="insight-weakspot" key={question.id}><div className="insight-weakspot-top"><strong>{index + 1}. {question.text}</strong><span>{question.subject || exam.subject || "Exam"}</span></div><div className="exam-option-list">{question.options.map((option) => <button type="button" key={option.id} className={`exam-option ${answers[question.id] === option.id ? "selected" : ""}`} disabled={Boolean(answers[question.id]) || busy || result !== null} onClick={() => void chooseAnswer(question,option.id)}>{option.text}</button>)}</div>{answers[question.id] && <small>Answer saved</small>}</article>)}<button type="button" className="feature-primary-button" disabled={busy} onClick={() => void finishExam()}>{busy ? "Saving…" : "Submit exam and see result"} <ArrowRight size={16} /></button></section>
      : <section className="insight-panel"><div className="insight-panel-title"><TrendingUp size={19}/><h2>Your exam analytics</h2></div>
        <div className="insight-stat-grid"><article className="insight-stat"><span>Exams completed</span><strong>{examAnalytics.totalExams}</strong></article><article className="insight-stat"><span>Average score</span><strong>{examAnalytics.averageScore}%</strong></article><article className="insight-stat"><span>Best score</span><strong>{examAnalytics.bestScore}%</strong></article></div>
        {examHistory.length > 0 && <div className="insight-review-list"><h3>Recent exam history</h3>{examHistory.slice(0,8).map(item=><article className="insight-weakspot" key={item.attemptId}><div className="insight-weakspot-top"><div><strong>{item.title}</strong><span>{[item.subject,item.topic].filter(Boolean).join(" · ")}</span></div><b>{item.score}%</b></div><small>{item.correctAnswers} correct · {item.wrongAnswers} wrong · {item.skippedAnswers} skipped · {new Date(item.completedAt).toLocaleDateString()}</small></article>)}</div>}
      </section>
      <section className="insight-panel"><div className="insight-panel-title"><Clock3 size={19} /><h2>Available exams</h2></div>
        {activeAttempts.length > 0 && <div className="insight-active-attempts"><h3>Continue an active attempt</h3>{activeAttempts.map((item) => <article className="insight-weakspot" key={item.attemptId}><div className="insight-weakspot-top"><div><strong>{item.title}</strong><span>{[item.subject, item.topic].filter(Boolean).join(" · ") || "Mixed questions"}</span></div><span>{item.totalQuestions} questions</span></div><p>Started {new Date(item.startedAt).toLocaleString()} · Your saved answers will be restored.</p><button type="button" className="feature-primary-button" disabled={busy} onClick={() => void resumeAttempt(item)}>{busy ? "Restoring…" : "Resume exam"} <ArrowRight size={16} /></button></article>)}</div>}{loading ? <p className="insight-empty">Loading exams…</p> : exams.length === 0 ? <div className="insight-empty"><p>No published exams are available yet. Once reviewed questions and a published exam are added to the database, they will appear here.</p><Link to="/recall" className="feature-primary-button">Practice recall <ArrowRight size={16} /></Link></div> : exams.map((item) => <article className="insight-weakspot" key={item.id}><div className="insight-weakspot-top"><div><strong>{item.title}</strong><span>{[item.subject,item.topic].filter(Boolean).join(" · ") || "Mixed questions"}</span></div><span>{item.durationMinutes ? `${item.durationMinutes} min` : "Untimed"}</span></div><p>{item.description || "A focused practice exam based on the active question bank."}</p><button type="button" className="feature-primary-button" disabled={busy} onClick={() => void startExam(item)}>{busy ? "Preparing…" : "Start exam"} <ArrowRight size={16} /></button></article>)}</section>}
    </PageShell>
  );
}


export function ReviewSchedulePage() {
  type SchedulePayload = {
    generatedAt: string;
    dueCount: number;
    upcomingCount: number;
    items: Array<{
      mistakeId: string;
      questionId: string;
      questionText: string;
      subject: string;
      topic: string;
      reviewCount: number;
      intervalDays: number;
      dueAt: string;
      dueInHours: number;
      status: "DUE" | "UPCOMING";
    }>;
  };

  const { data, loading, error } = useApiData<SchedulePayload>("/api/review-schedule");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewActionError, setReviewActionError] = useState<string | null>(null);

  async function markReviewed(mistakeId: string) {
    setReviewingId(mistakeId);
    setReviewActionError(null);
    try {
      const response = await fetch(apiUrl(`/api/review-schedule/${mistakeId}/reviewed`), {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not record this review.");
      window.location.reload();
    } catch (cause) {
      setReviewActionError(cause instanceof Error ? cause.message : "Could not record this review.");
      setReviewingId(null);
    }
  }

  return (
    <PageShell
      eyebrow="SPACED REPETITION"
      title="Review at the right time."
      description="A transparent schedule based on saved mistakes. Intervals are rule-based, not AI predictions."
    >
      <LoadState loading={loading} error={error} />
      {data && (
        <>
          <section className="insight-stat-grid">
            <article className="insight-stat"><span>Due now</span><strong>{data.dueCount}</strong><small>Unresolved mistakes ready to revisit</small></article>
            <article className="insight-stat"><span>Coming up</span><strong>{data.upcomingCount}</strong><small>Scheduled for a later review</small></article>
          </section>
          <section className="insight-panel">
            <div className="insight-panel-title"><CalendarClock size={19} /><h2>Your review queue</h2></div>
            {reviewActionError && <p className="insight-error" role="alert">{reviewActionError}</p>}
            {data.items.length === 0 ? (
              <p className="insight-empty">No unresolved mistakes yet. Complete a recall session and your review queue will appear here.</p>
            ) : (
              <div className="insight-review-list">
                {data.items.map((item) => (
                  <article className="insight-review-item" key={item.mistakeId}>
                    <div className="insight-review-copy">
                      <span className="feature-eyebrow">{item.subject} · {item.topic}</span>
                      <h3>{item.questionText}</h3>
                      <p>Review interval: {item.intervalDays} day{item.intervalDays === 1 ? "" : "s"} · Previous reviews: {item.reviewCount}</p>
                    </div>
                    <div className="insight-review-actions">
                      <span className={item.status === "DUE" ? "insight-review-status is-due" : "insight-review-status"}>
                        {item.status === "DUE" ? "Due now" : `Due in ${Math.max(1, Math.ceil(item.dueInHours / 24))}d`}
                      </span>
                      <button type="button" className="feature-secondary-button" onClick={() => void markReviewed(item.mistakeId)} disabled={reviewingId === item.mistakeId}>
                        {reviewingId === item.mistakeId ? "Saving…" : "I reviewed this"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <Link to="/recall" className="feature-primary-button">Practice recall <ArrowRight size={16} /></Link>
          </section>
        </>
      )}
    </PageShell>
  );
}

