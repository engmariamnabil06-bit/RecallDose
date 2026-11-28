import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Clock3, Edit3, PlayCircle, ShieldCheck } from "lucide-react";
import { apiUrl } from "../lib/api";
import "./admin-exam-builder.css";

type Question = { id: string; text: string; subject: string | null; topic: string | null; difficulty: string; sourceTitle: string | null };
type Exam = { id: string; title: string; description: string | null; subject: string | null; topic: string | null; durationMinutes: number | null; status: string; questionCount: number; questionIds: string[] };

export default function AdminExamBuilder() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const meResponse = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
      const me = await meResponse.json().catch(() => ({}));
      if (!meResponse.ok) throw new Error(me.message || "Please sign in.");
      if (me.user?.role !== "ADMIN") { setAllowed(false); return; }
      setAllowed(true);
      const [examResponse, questionResponse] = await Promise.all([
        fetch(apiUrl("/api/admin/exams"), { credentials: "include" }),
        fetch(apiUrl("/api/admin/exams/question-bank"), { credentials: "include" }),
      ]);
      const [examData, questionData] = await Promise.all([
        examResponse.json().catch(() => ({})), questionResponse.json().catch(() => ({})),
      ]);
      if (!examResponse.ok) throw new Error(examData.message || "Could not load exams.");
      if (!questionResponse.ok) throw new Error(questionData.message || "Could not load approved questions.");
      setExams(Array.isArray(examData.exams) ? examData.exams : []);
      setQuestions(Array.isArray(questionData.questions) ? questionData.questions : []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load the exam workspace."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const visibleQuestions = useMemo(() => questions.filter((question) =>
    (!subject.trim() || question.subject === subject.trim()) &&
    (!topic.trim() || question.topic === topic.trim()) &&
    (!questionSearch.trim() || (question.text + " " + (question.subject || "") + " " + (question.topic || "")).toLowerCase().includes(questionSearch.trim().toLowerCase()))
  ), [questions, subject, topic, questionSearch]);

  function toggleQuestion(id: string) {
    setSelectedQuestionIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }
  function toggleVisibleQuestions() {
    const ids = visibleQuestions.map((question) => question.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedQuestionIds.includes(id));
    setSelectedQuestionIds((current) => allSelected
      ? current.filter((id) => !ids.includes(id))
      : Array.from(new Set([...current, ...ids])).slice(0, 100));
  }
  function editQuestionSet(exam: Exam) {
    setEditingExam(exam); setTitle(exam.title); setDescription(exam.description || "");
    setSubject(exam.subject || ""); setTopic(exam.topic || "");
    setDurationMinutes(exam.durationMinutes ? String(exam.durationMinutes) : "");
    setSelectedQuestionIds(exam.questionIds || []);
    setError(""); setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function clearForm() {
    setEditingExam(null); setTitle(""); setDescription(""); setSubject(""); setTopic("");
    setDurationMinutes("30"); setSelectedQuestionIds([]); setQuestionSearch("");
  }

  async function saveExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!selectedQuestionIds.length || selectedQuestionIds.length > 100) {
      setError("Choose between 1 and 100 approved questions for this fixed exam set.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    try {
      const editing = Boolean(editingExam);
      const url = editing ? "/api/admin/exams/" + editingExam!.id + "/questions" : "/api/admin/exams";
      const body = editing ? { questionIds: selectedQuestionIds } : {
        title, description, subject, topic, durationMinutes, questionIds: selectedQuestionIds,
      };
      const response = await fetch(apiUrl(url), {
        method: editing ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not save the exam.");
      setNotice((payload.message || "Exam saved.") + " " + (payload.questionCount ?? selectedQuestionIds.length) + " fixed question(s).");
      clearForm();
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save the exam."); }
    finally { setBusy(false); }
  }

  async function setStatus(exam: Exam, action: "publish" | "unpublish") {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(apiUrl("/api/admin/exams/" + exam.id + "/" + action), { method: "POST", credentials: "include" });
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
      <section className="ae-heading"><span><ClipboardList size={16}/> EXAM BUILDER</span><h1>Build a fixed exam.</h1><p>Select the exact approved questions that belong to this exam. Every attempt uses the same question set; only the order is shuffled.</p></section>
      {error && <p className="ae-error" role="alert">{error}</p>}{notice && <p className="ae-notice" role="status">{notice}</p>}
      {allowed === false ? <section className="ae-panel"><h2>Administrator access required</h2><p>This workspace is only available to ADMIN accounts.</p></section> : <>
        <section className="ae-panel">
          <h2>{editingExam ? "Edit question set · " + editingExam.title : "Create and publish an exam"}</h2>
          <form className="ae-form" onSubmit={(event)=>void saveExam(event)}>
            {!editingExam && <>
              <label>Exam title<input required maxLength={180} value={title} onChange={(event)=>setTitle(event.target.value)} placeholder="e.g. Cardiovascular Pharmacology — Practice 1"/></label>
              <label>Description<textarea maxLength={1200} rows={3} value={description} onChange={(event)=>setDescription(event.target.value)} placeholder="What will this exam cover?"/></label>
              <div className="ae-grid">
                <label>Subject filter<input maxLength={120} value={subject} onChange={(event)=>setSubject(event.target.value)} placeholder="Exact subject name; blank = mixed"/></label>
                <label>Topic filter<input maxLength={160} value={topic} onChange={(event)=>setTopic(event.target.value)} placeholder="Exact topic name; blank = mixed"/></label>
                <label>Duration in minutes<input type="number" min={1} max={240} value={durationMinutes} onChange={(event)=>setDurationMinutes(event.target.value)} placeholder="Blank = untimed"/></label>
              </div>
            </>}
            {editingExam && <p className="ae-editing-note">You are only replacing the fixed question set. The exam title, filters, duration and existing student attempts are preserved.</p>}
            <div className="ae-question-picker">
              <div className="ae-picker-head"><div><strong>Approved questions</strong><span>{selectedQuestionIds.length}/100 selected · {visibleQuestions.length} matching filter</span></div><button type="button" onClick={toggleVisibleQuestions} disabled={!visibleQuestions.length}>{visibleQuestions.length>0&&visibleQuestions.every(q=>selectedQuestionIds.includes(q.id))?"Unselect visible":"Select all visible"}</button></div>
              <input className="ae-question-search" value={questionSearch} onChange={(event)=>setQuestionSearch(event.target.value)} placeholder="Search the approved question bank…"/>
              <div className="ae-question-list">
                {visibleQuestions.map((question)=><label className="ae-question-option" key={question.id}><input type="checkbox" checked={selectedQuestionIds.includes(question.id)} onChange={()=>toggleQuestion(question.id)} disabled={!selectedQuestionIds.includes(question.id)&&selectedQuestionIds.length>=100}/><span><strong>{question.text}</strong><small>{question.subject||"Uncategorized"} · {question.topic||"General"} · {question.difficulty}{question.sourceTitle ? " · " + question.sourceTitle : ""}</small></span></label>)}
                {visibleQuestions.length===0&&<p className="ae-empty">No approved active questions match these filters.</p>}
              </div>
            </div>
            <div className="ae-form-actions"><button className="ae-primary" type="submit" disabled={busy||selectedQuestionIds.length===0}>{busy?"Saving…":editingExam?"Save fixed question set":"Publish exam with selected questions"}</button>{editingExam&&<button type="button" className="ae-cancel" onClick={clearForm} disabled={busy}>Cancel edit</button>}</div>
          </form>
        </section>
        <section className="ae-panel"><div className="ae-panel-head"><h2>Exam catalogue</h2><span>{exams.length} exams</span></div>
          {loading?<p>Loading exams…</p>:exams.length===0?<p>No exams created yet. Approve questions first, then select a fixed question set.</p>:<div className="ae-list">{exams.map(exam=><article className="ae-item" key={exam.id}>
            <div className="ae-item-top"><div><h3>{exam.title}</h3><p>{[exam.subject,exam.topic].filter(Boolean).join(" · ")||"Mixed question set"}</p></div><span className={exam.status==="PUBLISHED"?"ae-live":"ae-draft"}>{exam.status}</span></div>
            <div className="ae-meta"><span><ClipboardList size={15}/>{exam.questionCount} fixed questions</span><span><Clock3 size={15}/>{exam.durationMinutes?String(exam.durationMinutes)+" min":"Untimed"}</span></div>
            {exam.description&&<p>{exam.description}</p>}
            {exam.questionCount===0&&<p className="ae-warning">This older exam has no fixed set yet. Edit its question set before publishing or starting it.</p>}
            <div className="ae-actions"><button type="button" disabled={busy} onClick={()=>editQuestionSet(exam)}><Edit3 size={15}/> Edit question set</button>{exam.status==="PUBLISHED"?<button type="button" disabled={busy} onClick={()=>void setStatus(exam,"unpublish")}>Unpublish</button>:<button type="button" disabled={busy||exam.questionCount===0} onClick={()=>void setStatus(exam,"publish")}><PlayCircle size={15}/> Publish</button>}</div>
          </article>)}</div>}
        </section>
      </>}
    </div>
  </main>;
}
