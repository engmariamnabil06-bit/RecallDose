import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpenCheck, CheckCircle2, ClipboardList, Plus, ShieldCheck } from "lucide-react";
import { apiUrl } from "../lib/api";
import "./admin-question-bank.css";

type QuestionRecord = {
  id: string;
  text: string;
  subject: string | null;
  topic: string | null;
  difficulty: string;
  reviewStatus: "DRAFT" | "APPROVED" | "ARCHIVED";
  sourceTitle: string | null;
  sourceReference: string | null;
  sourcePage: string | null;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
};

const emptyOptions = ["", "", "", ""];

export default function AdminQuestionBank() {
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [sourcePage, setSourcePage] = useState("");
  const [options, setOptions] = useState(emptyOptions);
  const [correctIndex, setCorrectIndex] = useState(0);

  async function loadQuestions() {
    setLoading(true);
    setError("");
    try {
      const meResponse = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
      const me = await meResponse.json().catch(() => ({}));
      if (!meResponse.ok) throw new Error(me.message || "Please sign in.");
      if (me.user?.role !== "ADMIN") {
        setAllowed(false);
        return;
      }
      setAllowed(true);
      const response = await fetch(apiUrl("/api/admin/questions"), { credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not load the question bank.");
      setQuestions(Array.isArray(payload.questions) ? payload.questions : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the admin workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadQuestions(); }, []);

  async function createDraft(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(apiUrl("/api/admin/questions"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text, explanation, subject, topic, difficulty, sourceTitle, sourceReference, sourcePage,
          options: options.map((option, index) => ({ text: option, isCorrect: index === correctIndex })),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not create this question.");
      setNotice(payload.message || "Draft saved. It is not visible to students until approved.");
      setText(""); setExplanation(""); setOptions(emptyOptions); setSourceTitle(""); setSourceReference(""); setSourcePage("");
      await loadQuestions();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this draft.");
    } finally { setBusy(false); }
  }

  async function moderate(id: string, action: "approve" | "archive") {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(apiUrl(`/api/admin/questions/${id}/${action}`), {
        method: "POST", credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not update this question.");
      setNotice(payload.message || "Question status updated.");
      await loadQuestions();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this question.");
    } finally { setBusy(false); }
  }

  return <main className="aq-page">
    <header className="aq-top"><Link to="/dashboard"><ArrowLeft size={16}/> Dashboard</Link><span><ShieldCheck size={16}/> RECALLDOSE · ADMIN</span><Link to="/admin/exams">Exam Builder →</Link></header>
    <div className="aq-shell">
      <section className="aq-heading"><span className="aq-kicker"><BookOpenCheck size={16}/> CONTENT QUALITY WORKSPACE</span><h1>Question bank <em>review.</em></h1><p>Create source-linked questions, check their answers, and approve them before they become available to learners.</p></section>
      {allowed === false ? <section className="aq-panel aq-denied"><ShieldCheck size={24}/><h2>Administrator access required</h2><p>This area is restricted to accounts with the ADMIN role.</p><Link to="/dashboard">Return to dashboard</Link></section> : <>
        {error && <p className="aq-error" role="alert">{error}</p>}
        {notice && <p className="aq-notice" role="status">{notice}</p>}
        <section className="aq-panel">
          <div className="aq-panel-title"><Plus size={19}/><div><h2>Create a question draft</h2><p>New questions remain unpublished until a source is recorded and an administrator approves them.</p></div></div>
          <form className="aq-form" onSubmit={(event) => void createDraft(event)}>
            <label>Question<textarea required minLength={10} maxLength={6000} value={text} onChange={(event) => setText(event.target.value)} rows={3} placeholder="Write one clear single-best-answer question…"/></label>
            <div className="aq-grid">
              <label>Subject<input required maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Pharmacology"/></label>
              <label>Topic<input required maxLength={160} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Beta blockers"/></label>
              <label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></label>
            </div>
            <fieldset className="aq-options"><legend>Answer options · choose exactly one correct answer</legend>{options.map((option, index) => <div className="aq-option" key={index}><input aria-label={`Option ${index + 1}`} required maxLength={1200} value={option} onChange={(event) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}/><label><input type="radio" name="correct-option" checked={correctIndex === index} onChange={() => setCorrectIndex(index)}/> Correct</label></div>)}</fieldset>
            <label>Explanation<textarea required minLength={10} maxLength={6000} value={explanation} onChange={(event) => setExplanation(event.target.value)} rows={3} placeholder="Explain why the correct answer is right and what the learner should understand…"/></label>
            <div className="aq-grid aq-source-grid">
              <label>Source title<input required maxLength={240} value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} placeholder="Textbook, guideline, lecture…"/></label>
              <label>Source page / section<input maxLength={80} value={sourcePage} onChange={(event) => setSourcePage(event.target.value)} placeholder="Page, chapter or section"/></label>
            </div>
            <label>Source reference<input required maxLength={1000} value={sourceReference} onChange={(event) => setSourceReference(event.target.value)} placeholder="ISBN, DOI, stable URL or institutional reference"/></label>
            <button className="aq-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save as unpublished draft"}</button>
          </form>
        </section>
        <section className="aq-panel">
          <div className="aq-panel-title"><ClipboardList size={19}/><div><h2>Review queue</h2><p>{questions.length} questions in the bank</p></div></div>
          {loading ? <p className="aq-empty">Loading questions…</p> : questions.length === 0 ? <p className="aq-empty">No questions have been added yet.</p> : <div className="aq-list">{questions.map((question) => <article className="aq-question" key={question.id}>
            <div className="aq-question-meta"><span>{question.subject || "Uncategorized"} · {question.topic || "General"}</span><b className={`aq-status aq-${question.reviewStatus.toLowerCase()}`}>{question.reviewStatus}</b></div>
            <h3>{question.text}</h3>
            <p>{question.sourceTitle || "No source title"}{question.sourcePage ? ` · ${question.sourcePage}` : ""}</p>
            <small>{question.sourceReference || "Source reference missing"} · {question.options.length} options</small>
            <div className="aq-actions">
              {question.reviewStatus === "DRAFT" && <button type="button" disabled={busy} onClick={() => void moderate(question.id, "approve")}><CheckCircle2 size={15}/> Approve & publish</button>}
              {question.reviewStatus !== "ARCHIVED" && <button type="button" className="aq-archive" disabled={busy} onClick={() => void moderate(question.id, "archive")}>Archive</button>}
            </div>
          </article>)}</div>}
        </section>
      </>}
    </div>
  </main>;
}
