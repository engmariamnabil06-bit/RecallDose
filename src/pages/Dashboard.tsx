import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";
import {
  Activity, Atom, Bell, BookOpen, Brain, CalendarDays, CheckCircle2,
  ChevronDown, ClipboardList, CloudUpload, Dna, FlaskConical, GraduationCap,
  HeartPulse, Home, LayoutDashboard, LogOut, Microscope, Moon, Pill,
  Search, Settings, Sparkles, Stethoscope, Target, TrendingUp, UserRound,
  Users, X, Zap, BookMarked, ChartNoAxesCombined, CircleHelp, Clock3,
  MessageSquareText, ArrowRight, Trophy, FileText, ShieldCheck,
} from "lucide-react";
import "./dashboard-refresh.css";

type User = { id: string; email: string; firstName: string; lastName: string; role: string; emailVerified: boolean };
type DashboardData = {
  stats: { recallStrength: number; questionsRecalled: number; correctAnswers: number; wrongAnswers: number; weakSpots: number; dayStreak: number };
  mistakes: Array<{ id: string; questionId: string; type: string; selectedAnswer: string | null; correctAnswer: string | null; reviewCount: number; resolved: boolean; createdAt: string }>;
  subjects: Array<{ subject: string; questionsSolved: number; correctAnswers: number; wrongAnswers: number; accuracy: number }>;
  weakestSubject: { subject: string; questionsSolved: number; correctAnswers: number; wrongAnswers: number; accuracy: number } | null;
  sessions: { total: number; completed: number };
};

const navGroups = [
  { label: "LEARN", items: [
    { label: "Home", to: "/dashboard", icon: Home },
    { label: "AI Tutor", to: "/ai-tutor", icon: Sparkles, tag: "NEW" },
    { label: "Exams", to: "/exams", icon: ClipboardList },
    { label: "Subjects & Curriculum", to: "/curriculum", icon: GraduationCap },
    { label: "Pharma Memory Lab", to: "/pharma-memory", icon: Pill },
    { label: "Anatomy Lab", to: "/curriculum", icon: Activity },
  ]},
  { label: "YOUR PROGRESS", items: [
    { label: "Recall Twin", to: "/dr-recall", icon: Brain },
    { label: "Mistake Bank", to: "/mistakes", icon: ShieldCheck },
    { label: "Review Schedule", to: "/review-schedule", icon: CalendarDays },
    { label: "Flashcards", to: "/study-tools", icon: BookMarked },
    { label: "Analytics", to: "/progress", icon: ChartNoAxesCombined },
  ]},
];

const motivationalLines = [
  "You’re not behind. You’re building.",
  "One day, your patients will thank you.",
  "Small steps today. Strong knowledge tomorrow.",
];

const subjectCards = [
  { name: "Anatomy", topics: "12 topics", icon: <Stethoscope />, color: "violet" },
  { name: "Physiology", topics: "11 topics", icon: <HeartPulse />, color: "pink" },
  { name: "Pharmacology", topics: "14 topics", icon: <Pill />, color: "purple" },
  { name: "Biochemistry", topics: "10 topics", icon: <Dna />, color: "blue" },
  { name: "Pathology", topics: "8 topics", icon: <Microscope />, color: "lavender" },
  { name: "Microbiology", topics: "9 topics", icon: <FlaskConical />, color: "cyan" },
];

function useTypewriterOnce(text: string, speed = 115) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, speed]);
  return typed;
}

function useTypewriter(lines: string[], speed = 48, pause = 1900) {
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = lines[lineIndex % lines.length];
    let delay = deleting ? 26 : speed;
    if (!deleting && text === current) delay = pause;
    else if (deleting && text === "") {
      setDeleting(false);
      setLineIndex((n) => (n + 1) % lines.length);
      return;
    }
    const timer = window.setTimeout(() => {
      if (!deleting && text === current) setDeleting(true);
      else if (deleting) setText(current.slice(0, Math.max(0, text.length - 1)));
      else setText(current.slice(0, text.length + 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [text, deleting, lineIndex, lines, speed, pause]);
  return text;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [darkGlow, setDarkGlow] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const typedMotivation = useTypewriter(motivationalLines, 48, 2200);
  const typedGreeting = useTypewriterOnce("hey future doctor", 125);
  const greetingName = user?.firstName || "Future Doctor";

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true); setError(null);
        const userRes = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
        if (!userRes.ok) throw new Error("Your session could not be loaded. Please sign in again.");
        const userData = await userRes.json();
        const dashRes = await fetch(apiUrl("/api/dashboard"), { credentials: "include" });
        const dashData = await dashRes.json();
        if (!dashRes.ok) throw new Error(dashData.message || "Unable to load dashboard data.");
        if (active) { setUser(userData.user); setDashboard(dashData); }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unable to load your dashboard.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const response = await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      navigate("/login", { replace: true });
    } catch (e) { setError(e instanceof Error ? e.message : "Could not sign out."); }
    finally { setSigningOut(false); }
  };

  const filteredSubjects = useMemo(() => subjectCards.filter((s) => s.name.toLowerCase().includes(searchText.toLowerCase())), [searchText]);

  if (loading) return <div className="rd-loading"><div className="rd-logo">R</div><span>Preparing your recall space…</span><div className="rd-loading-line" /></div>;
  if (!user || !dashboard) return <div className="rd-loading"><div className="rd-logo">R</div><h2>We couldn’t load your recall space</h2><p>{error || "Please sign in and try again."}</p><Link className="rd-primary-btn" to="/login">Back to login <ArrowRight size={16}/></Link></div>;

  const stats = dashboard.stats;
  const initials = `${user.firstName?.[0] || "R"}${user.lastName?.[0] || "D"}`.toUpperCase();
  const completedToday = dashboard.sessions?.completed || 0;
  const tasks = [
    { label: "Anatomy: Heart", progress: Math.min(stats.recallStrength, 100), count: `${Math.round(stats.recallStrength / 5)}/20`, done: stats.recallStrength >= 80 },
    { label: "Pharmacology: Antibiotics", progress: Math.min(Math.round((stats.correctAnswers / Math.max(1, stats.questionsRecalled)) * 100), 100), count: `${Math.min(stats.correctAnswers, 15)}/15`, done: false },
    { label: "Biochemistry: Glycolysis", progress: Math.min(Math.round((stats.questionsRecalled / 10) * 10), 100), count: `${Math.min(stats.questionsRecalled, 10)}/10`, done: false },
  ];

  return <div className={`rd-app ${darkGlow ? "rd-glow-on" : "rd-glow-off"}`}>
    <aside className={`rd-sidebar ${mobileNav ? "rd-sidebar-open" : ""}`}>
      <Link to="/dashboard" className="rd-brand"><span className="rd-logo">R</span><span>RECALLDOSE</span></Link>
      <button className="rd-mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={20}/></button>
      <nav className="rd-navigation">
        {navGroups.map((group) => <div className="rd-nav-group" key={group.label}>
          <div className="rd-nav-caption">{group.label}</div>
          {group.items.map(({ label, to, icon: Icon, tag }) => <Link onClick={() => setMobileNav(false)} key={label} to={to} className={`rd-nav-item ${label === "Home" ? "rd-nav-active" : ""}`}><Icon size={18}/><span>{label}</span>{tag && <small>{tag}</small>}</Link>)}
        </div>)}
        <div className="rd-nav-group"><div className="rd-nav-caption">WORKSPACE</div>
          <Link className="rd-nav-item" to="/study-tools"><FileText size={18}/><span>Notes & Flashcards</span></Link>
          <Link className="rd-nav-item" to="/curriculum"><CloudUpload size={18}/><span>Upload & OCR</span><small>NEW</small></Link>
        </div>
      </nav>
      <div className="rd-pro-card"><span className="rd-pro-icon"><Zap size={19}/></span><strong>Make every session count</strong><p>Build a consistent study rhythm, one recall at a time.</p><Link to="/progress">Explore your progress <ArrowRight size={14}/></Link></div>
      <div className="rd-sidebar-bottom"><Link to="/profile" className="rd-profile-mini"><span className="rd-avatar">{initials}</span><span className="rd-profile-copy"><strong>{user.firstName} {user.lastName}</strong><small>Medical Student</small></span><ChevronDown size={16}/></Link><button className="rd-signout" onClick={signOut} disabled={signingOut}><LogOut size={16}/>{signingOut ? "Signing out…" : "Sign out"}</button></div>
    </aside>
    {mobileNav && <button className="rd-nav-backdrop" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}

    <main className="rd-main">
      <header className="rd-topbar"><button className="rd-menu-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><LayoutDashboard size={20}/></button><div className="rd-search"><Search size={18}/><input aria-label="Search topics" placeholder="Search topics, drugs, questions…" value={searchText} onChange={(e) => setSearchText(e.target.value)}/><kbd>⌘ K</kbd></div><div className="rd-top-actions"><button className="rd-icon-button" onClick={() => setDarkGlow((v) => !v)} title="Toggle glow"><Moon size={19}/></button><div className="rd-notification-wrap"><button className="rd-icon-button" onClick={() => setNotificationsOpen((v) => !v)} aria-label="Notifications"><Bell size={19}/><i>{dashboard.mistakes.length}</i></button>{notificationsOpen && <div className="rd-notification-pop"><strong>Study reminders</strong><p>{dashboard.mistakes.length ? `${dashboard.mistakes.length} mistakes are ready to review.` : "Your study space is up to date."}</p><Link to="/review-schedule" onClick={() => setNotificationsOpen(false)}>Open review schedule</Link></div>}</div><Link to="/profile" className="rd-top-user"><span className="rd-avatar">{initials}</span><span><strong>{user.firstName} {user.lastName}</strong><small>Medical Student</small></span><ChevronDown size={15}/></Link></div></header>

      <div className="rd-dashboard-content">
        {error && <div className="rd-inline-error"><CircleHelp size={17}/>{error}<button onClick={() => setError(null)} aria-label="Dismiss"><X size={15}/></button></div>}
        <section className="rd-hero-grid">
          <div className="rd-hero-main"><div className="rd-hero-decor rd-decor-left"><Stethoscope/></div><div className="rd-hero-decor rd-decor-right"><Brain/></div><div className="rd-hero-kicker"><span className="rd-live-dot"/> YOUR NEXT CHAPTER STARTS HERE</div><h1><span>{typedGreeting}</span><i className="rd-heading-cursor" aria-hidden="true" /></h1><div className="rd-typed-line"><span>{typedMotivation}</span><i className="rd-cursor"/></div><p className="rd-hero-description">Every page you read, every question you try,<br className="rd-desktop-break"/> brings you closer to the doctor you dream of becoming.</p><p className="rd-hero-whisper">You’re capable of more than you think.</p><div className="rd-hero-actions"><Link className="rd-primary-btn" to="/recall"><Zap size={17}/> Start studying <ArrowRight size={16}/></Link><Link className="rd-secondary-btn" to="/ai-tutor"><Sparkles size={17}/> Ask your AI Tutor</Link></div></div>
          <aside className="rd-today-card"><div className="rd-card-heading"><div><span className="rd-heading-icon"><CalendarDays size={18}/></span><div><h2>Today’s plan</h2><p>A little progress adds up.</p></div></div><Link to="/daily-dose">Edit</Link></div><div className="rd-task-list">{tasks.map((task) => <div className="rd-task" key={task.label}><div className="rd-task-top"><span className={`rd-task-check ${task.done ? "is-done" : ""}`}>{task.done && <CheckCircle2 size={14}/>}</span><span className="rd-task-name">{task.label}</span><small>{task.count}</small></div><div className="rd-progress-track"><span style={{ width: `${task.progress}%` }}/></div></div>)}</div><Link className="rd-plan-btn" to="/daily-dose"><ArrowRight size={17}/> Continue today’s plan</Link><div className="rd-plan-footer"><span><Clock3 size={14}/> 15–20 min</span><span><CheckCircle2 size={14}/> {completedToday} sessions completed</span></div></aside>
        </section>

        <section className="rd-stats-grid" aria-label="Learning statistics">
          <Link to="/pharma-memory" className="rd-stat-card"><span className="rd-stat-icon icon-purple"><Pill/></span><div className="rd-stat-content"><span className="rd-stat-value">{Math.max(100, stats.questionsRecalled)}</span><span className="rd-stat-label">Drugs to remember</span><p>Names, mechanisms, indications, side effects…</p></div><ArrowRight className="rd-stat-arrow" size={17}/></Link>
          <Link to="/progress" className="rd-stat-card"><span className="rd-stat-icon icon-blue"><BookOpen/></span><div className="rd-stat-content"><span className="rd-stat-value">{Math.max(1000, stats.correctAnswers)}</span><span className="rd-stat-label">Facts to connect</span><p>Concepts that make sense when they connect.</p></div><ArrowRight className="rd-stat-arrow" size={17}/></Link>
          <Link to="/recall" className="rd-stat-card"><span className="rd-stat-icon icon-pink"><Atom/></span><div className="rd-stat-content"><span className="rd-stat-value">∞</span><span className="rd-stat-label">Questions to practice</span><p>Because knowing isn’t the same as recalling.</p></div><ArrowRight className="rd-stat-arrow" size={17}/></Link>
        </section>

        <section className="rd-work-grid"><div className="rd-section-block"><div className="rd-section-title"><div><span className="rd-section-eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Continue learning</h2></div><Link to="/curriculum">View curriculum <ArrowRight size={14}/></Link></div><div className="rd-continue-grid">{[
          { title: "Cardiac Cycle", subject: "Physiology", pct: Math.min(100, stats.recallStrength), icon: <HeartPulse/>, tint: "pink", to: "/curriculum" },
          { title: "Beta Blockers", subject: "Pharmacology", pct: Math.min(100, stats.correctAnswers * 4), icon: <Pill/>, tint: "purple", to: "/pharma-memory" },
          { title: "Neurons", subject: "Anatomy", pct: Math.min(100, stats.questionsRecalled * 3), icon: <Brain/>, tint: "blue", to: "/curriculum" },
          { title: "Glycolysis", subject: "Biochemistry", pct: Math.min(100, stats.correctAnswers * 2), icon: <Dna/>, tint: "cyan", to: "/curriculum" },
        ].map((item) => <Link className="rd-continue-card" to={item.to} key={item.title}><div className="rd-continue-copy"><strong>{item.title}</strong><span>{item.subject}</span><div className="rd-progress-track"><span style={{ width: `${item.pct}%` }}/></div><small>{item.pct}% reviewed</small></div><span className={`rd-continue-art ${item.tint}`}>{item.icon}</span></Link>)}</div></div>
          <div className="rd-section-block rd-quick-block"><div className="rd-section-title"><div><span className="rd-section-eyebrow">ONE CLICK AWAY</span><h2>Quick actions</h2></div></div><div className="rd-quick-grid">{[
            { label: "AI Tutor", icon: <MessageSquareText/>, to: "/ai-tutor" }, { label: "Exam Simulator", icon: <ClipboardList/>, to: "/exams" }, { label: "Upload Notes", icon: <CloudUpload/>, to: "/study-tools" }, { label: "Mistake Bank", icon: <Target/>, to: "/mistakes" }, { label: "Review Schedule", icon: <CalendarDays/>, to: "/review-schedule" }, { label: "Flashcards", icon: <BookMarked/>, to: "/study-tools" },
          ].map((item) => <Link to={item.to} className="rd-quick-action" key={item.label}><span>{item.icon}</span>{item.label}<ArrowRight className="rd-quick-arrow" size={14}/></Link>)}</div></div></section>

        <section className="rd-bottom-grid"><div className="rd-section-block"><div className="rd-section-title"><div><span className="rd-section-eyebrow">YOUR LEARNING MAP</span><h2>Explore subjects</h2></div><Link to="/curriculum">View all <ArrowRight size={14}/></Link></div><div className="rd-subject-grid">{filteredSubjects.map((subject) => <Link to="/curriculum" className="rd-subject-card" key={subject.name}><span className={`rd-subject-art ${subject.color}`}>{subject.icon}</span><strong>{subject.name}</strong><small>{subject.topics}</small></Link>)}{filteredSubjects.length === 0 && <p className="rd-no-results">No matching subjects. Try another search.</p>}</div></div>
          <div className="rd-section-block rd-progress-panel"><div className="rd-section-title"><div><span className="rd-section-eyebrow">YOUR MOMENTUM</span><h2>Progress snapshot</h2></div><Link to="/progress">Details <ArrowRight size={14}/></Link></div><div className="rd-momentum-score"><div className="rd-ring" style={{ "--score": `${stats.recallStrength}%` } as React.CSSProperties}><div><strong>{stats.recallStrength}%</strong><small>recall strength</small></div></div><div className="rd-momentum-copy"><strong>{stats.dayStreak} day streak <TrendingUp size={16}/></strong><p>Consistency beats cramming. Keep your rhythm going.</p><Link to="/recall">Practice now <ArrowRight size={14}/></Link></div></div><div className="rd-progress-facts"><span><CheckCircle2 size={15}/> {stats.correctAnswers} correct answers</span><span><Target size={15}/> {stats.weakSpots} topics to revisit</span></div></div></section>

        <footer className="rd-quote"><span className="rd-quote-mark">“</span><div><strong>Discipline today, save lives tomorrow.</strong><p>You’re not just studying for exams, you’re preparing to be someone’s hope.</p></div><span className="rd-quote-art"><HeartPulse/></span></footer>
        <div className="rd-footer-line"><span>RECALLDOSE · Your knowledge, connected.</span><span><CircleHelp size={13}/> Educational support, not a substitute for clinical guidance.</span></div>
      </div>
    </main>
  </div>;
}
