import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpenCheck, FileText, GraduationCap, Send, Sparkles, Stethoscope, Upload } from "lucide-react";
import { apiUrl } from "../lib/api";
import "./advanced-tutor.css";
type Mode = "oral-exam" | "lecture-grounded";
type Turn = { role: "user" | "assistant"; content: string };
function markSource(raw: string): string {
  if (/\[PAGE\s+\d+\]|\[SECTION:/i.test(raw)) return raw;
  const pages = raw.split("\f").map((page) => page.trim()).filter(Boolean);
  if (pages.length > 1) return pages.map((page, index) => "[PAGE " + (index + 1) + "]\n" + page).join("\n\n");
  return "[TEXT SOURCE — page boundaries unavailable]\n" + raw;
}
export default function AdvancedTutor() {
  const location = useLocation(); const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(location.state?.mode === "lecture-grounded" ? "lecture-grounded" : "oral-exam");
  const [source, setSource] = useState(typeof location.state?.context === "string" ? markSource(location.state.context) : "");
  const [message, setMessage] = useState(typeof location.state?.message === "string" ? location.state.message : "");
  const [history, setHistory] = useState<Turn[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [provider, setProvider] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); const prompt = message.trim(); if (prompt.length < 2 || busy) return;
    if (mode === "lecture-grounded" && source.trim().length < 80) { setError("Upload your lecture or paste a meaningful section first."); return; }
    setError(""); setHistory((old) => [...old, { role: "user", content: prompt }]); setMessage(""); setBusy(true);
    try {
      const response = await fetch(apiUrl("/api/ai/advanced-chat"), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, message: prompt, source: source.trim(), history: history.slice(-12) }) });
      const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "Could not get an AI response.");
      setHistory((old) => [...old, { role: "assistant", content: payload.answer }]); setProvider(payload.provider || "");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); } finally { setBusy(false); }
  }
  function changeMode(next: Mode) { setMode(next); setHistory([]); setError(""); setProvider(""); }
  return <main className="at-page"><header className="at-top"><Link to="/study-tools"><ArrowLeft size={16}/> Study workspace</Link><span><b>R</b> RECALLDOSE AI</span></header><section className="at-shell"><div className="at-heading"><span><Sparkles size={14}/> ADVANCED LEARNING MODES</span><h1>{mode === "oral-exam" ? "AI Oral Exam" : "Lecture-Grounded Answers"}</h1><p>Practice your reasoning with an examiner, or ask questions using your own lecture as the source of truth.</p></div>
  <div className="at-tabs"><button className={mode === "oral-exam" ? "active" : ""} onClick={() => changeMode("oral-exam")}><Stethoscope size={17}/> AI Oral Exam</button><button className={mode === "lecture-grounded" ? "active" : ""} onClick={() => changeMode("lecture-grounded")}><BookOpenCheck size={17}/> Lecture-Grounded Answers</button></div>
  {mode === "oral-exam" ? <div className="at-info"><GraduationCap size={19}/><div><strong>One question at a time — just like a viva.</strong><p>The examiner waits for your answer, evaluates how you think and asks one adaptive follow-up. Start by entering your faculty, subject and topic. You can type or use your device's voice typing.</p></div></div> : <div className="at-info"><FileText size={19}/><div><strong>Lecture first. Citations always.</strong><p>Answers are limited to the source. PDF page markers are used only when extraction preserves page boundaries; text without reliable markers is labelled accordingly.</p></div></div>}
  {mode === "lecture-grounded" && <div className="at-source"><div className="at-source-head"><div><strong>Lecture material</strong><small>Required · do not include patient-identifiable information</small></div><button onClick={() => navigate("/upload-ocr", { state: { returnTo: "/advanced-tutor", mode } })}><Upload size={15}/> Upload lecture</button></div><textarea value={source} onChange={(e) => setSource(e.target.value)} rows={8} maxLength={18000} placeholder="Upload a lecture or paste its text. Keep [PAGE 4] markers if available."/><small>{source.length.toLocaleString()} / 18,000 characters · verify OCR against the original.</small></div>}
  <div className="at-chat" aria-live="polite">{history.length === 0 ? <div className="at-empty"><div><Sparkles size={25}/></div><h2>{mode === "oral-exam" ? "Ready for your viva?" : "Ask your lecture a question."}</h2><p>{mode === "oral-exam" ? "Example: Start an oral exam in Pharmacology about beta blockers for a third-year student." : "Example: Explain the mechanism on page 6 and cite the lecture section."}</p></div> : history.map((turn, index) => <article className={"at-turn " + turn.role} key={turn.role + "-" + index}><span>{turn.role === "assistant" ? "DR" : "YOU"}</span><p>{turn.content}</p></article>)}{busy && <div className="at-loading">The examiner is thinking…</div>}</div>
  <form className="at-compose" onSubmit={(e) => void submit(e)}><label>{mode === "oral-exam" ? "Your answer or exam topic" : "Your lecture question"}</label><textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} placeholder={mode === "oral-exam" ? "Start an oral exam in Anatomy about the brachial plexus…" : "Ask a question about the lecture…"} required/><div className="at-compose-foot"><small>{mode === "oral-exam" ? "After the first question, answer in your own words." : "The AI should say when the lecture does not contain the answer."}<br/>{provider ? "AI provider: " + provider : ""}</small><button disabled={busy || message.trim().length < 2 || (mode === "lecture-grounded" && source.trim().length < 80)}>{busy ? "Thinking…" : <>Send <Send size={15}/></>}</button></div>{error && <p className="at-error" role="alert">{error}</p>}</form>
  <p className="at-disclaimer">Educational simulation only, not an official examination or medical advice. Configure AI API credentials on the server before use.</p></section></main>;
}
