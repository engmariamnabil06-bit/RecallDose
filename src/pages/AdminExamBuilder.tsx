import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Clock3, PlayCircle, ShieldCheck } from "lucide-react";
import { apiUrl } from "../lib/api";
import "./admin-exam-builder.css";

type Exam = { id: string; title: string; description: string | null; subject: string | null; topic: string | null; durationMinutes: number | null; status: string; matchingQuestionCount: number };

export default function AdminExamBuilder() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");

  async function load() {
    setLoading(true); setError("");
    try {
      const meResponse = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
      const me = await meResponse.json().catch(() => ({}));
      if (!meResponse.ok) throw new Error(me.message || "Please sign in.");
      if (me.user?.role !== "ADMIN") { setAllowed(false); return; }
      setAllowed(true);
      const response = await fetch(apiUrl("/api/admin/exams"), { credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not load exams.");
      setExams(Array.isArray(payload.exams) ? payload.exams : []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load the exam workspace."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function createExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(apiUrl("/api/admin/exams"), {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, subject, topic, durationMinutes }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not publish the exam.");
      setNotice(`${payload.message} ${payload.matchingQuestionCount} matching question(s) are available; each attempt uses up to 20.`);
      setTitle(""); setDescription("");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not publish the exam."); }
    finally { setBusy(false); }
  }

  async function setStatus(exam: Exam, action: "publish" | "unpublish") {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(apiUrl(`/api/admin/exams/${exam.id}/${action}`), { method: "POST", credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not change exam status.");
      setNotice(payload.message || "Exam status updated.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update the exam."); }
    finally { setBusy(false); }
  }

  return <main className="ae-page">
    <header className="ae-top"><Link to="/dashboard"><ArrowLeft size={16}/> Dashboard</Link><Link to="/admin/questions">Question Bank →</Link><span><ShieldCheck size={16}/> ADMIN WORKSPACE</span></header>
    <div className="ae-shell">
      <section className="ae-heading"><span><ClipboardList size={16}/> EXAM BUILDER</span><h1>Publish an exam.</h1><p>Choose a subject and topic to make a timed or untimed exam from approved, active questions. Each student attempt draws up to 20 matching questions.</p></section>
      {error && <p className="ae-error" role="alert">{error}</p>}{notice && <p className="ae-notice" role="status">{notice}</p>}
      {allowed === false ? <section className="ae-panel"><h2>Administrator access required</h2><p>This workspace is only available to ADMIN accounts.</p></section> : <>
        <section className="ae-panel"><h2>Create and publish</h2><form className="ae-form" onSubmit={(event)=>void createExam(event)}>
          <label>Exam title<input required maxLength={180} value={title} onChange={(event)=>setTitle(event.target.value)} placeholder="e.g. Cardiovascular Pharmacology — Practice 1"/></label>
          <label>Description<textarea maxLength={1200} rows={3} value={description} onChange={(event)=>setDescription(event.target.value)} placeholder="What will this exam cover?"/></label>
          <div className="ae-grid"><label>Subject filter<input maxLength={120} value={subject} onChange={(event)=>setSubject(event.target.value)} placeholder="Exact subject name; blank = all"/></label><label>Topic filter<input maxLength={160} value={topic} onChange={(event)=>setTopic(event.target.value)} placeholder="Exact topic name; blank = all"/></label><label>Duration in minutes<input type="number" min={1} max={240} value={durationMinutes} onChange={(event)=>setDurationMinutes(event.target.value)} placeholder="Blank = untimed"/></label></div>
          <button className="ae-primary" type="submit" disabled={busy}>{busy ? "Publishing…" : "Publish exam"}</button>
        </form></section>
        <section className="ae-panel"><div className="ae-panel-head"><h2>Exam catalogue</h2><span>{exams.length} exams</span></div>
          {loading ? <p>Loading exams…</p> : exams.length === 0 ? <p>No exams created yet. Approve questions first, then publish your first exam.</p> : <div className="ae-list">{exams.map((exam)=><article className="ae-item" key={exam.id}>
            <div className="ae-item-top"><div><h3>{exam.title}</h3><p>{[exam.subject,exam.topic].filter(Boolean).join(" · ") || "Mixed question set"}</p></div><span className={exam.status==="PUBLISHED"?"ae-live":"ae-draft"}>{exam.status}</span></div>
            <div className="ae-meta"><span><ClipboardList size={15}/>{exam.matchingQuestionCount} matching active questions</span><span><Clock3 size={15}/>{exam.durationMinutes ? `${exam.durationMinutes} min` : "Untimed"}</span></div>
            {exam.description && <p>{exam.description}</p>}
            <div className="ae-actions">{exam.status==="PUBLISHED" ? <button type="button" disabled={busy} onClick={()=>void setStatus(exam,"unpublish")}>Unpublish</button> : <button type="button" disabled={busy || exam.matchingQuestionCount===0} onClick={()=>void setStatus(exam,"publish")}><PlayCircle size={15}/> Publish again</button>}</div>
          </article>)}</div>}
        </section>
      </>}
    </div>
  </main>;
}
