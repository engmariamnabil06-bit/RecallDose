import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Bot, BookOpen, Brain, Send, Sparkles, Stethoscope } from "lucide-react";
import { apiUrl } from "../lib/api";
import "./ai-tutor.css";

type Mode = "tutor" | "explain" | "mnemonic";
type Message = { role: "user" | "assistant"; text: string };

const prompts: Record<Mode, { label: string; title: string; placeholder: string }> = {
  tutor: { label: "AI Tutor", title: "Understand the concept, not just memorize it.", placeholder: "Ask about a concept, pathway, drug class, or lecture…" },
  explain: { label: "Explain a mistake", title: "Turn a wrong answer into a useful lesson.", placeholder: "Paste the question, your answer, and the correct answer…" },
  mnemonic: { label: "Memory aid", title: "Build a mnemonic that actually makes sense.", placeholder: "What facts, list, or drug class do you need to remember?" },
};

export default function AITutor() {
  const location = useLocation();
  const incomingContext = typeof location.state?.context === "string" ? location.state.context : "";
  const [mode, setMode] = useState<Mode>("tutor");
  const [message, setMessage] = useState("");
  const [context, setContext] = useState(incomingContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/ai/status"), { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(false));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const question = message.trim();
    if (!question || busy) return;
    setError("");
    setMessages((current) => [...current, { role: "user", text: question }]);
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch(apiUrl("/api/ai/chat"), {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, message: question, context: context.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not get an AI response.");
      setMessages((current) => [...current, { role: "assistant", text: payload.answer }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  return <main className="ai-page">
    <div className="ai-topbar"><Link to="/dashboard" className="ai-back"><ArrowLeft size={16} /> Dashboard</Link><span className="ai-brand"><span>R</span> RECALLDOSE</span></div>
    <section className="ai-shell">
      <div className="ai-heading"><span className="ai-eyebrow"><Sparkles size={14} /> PERSONALIZED STUDY SPACE</span><h1>{prompts[mode].title}</h1><p>Learn in context, ask follow-up questions, and connect explanations to your course material.</p></div>
      <div className="ai-mode-tabs" role="tablist" aria-label="AI study mode">
        {(["tutor", "explain", "mnemonic"] as Mode[]).map((item) => <button type="button" role="tab" aria-selected={mode === item} className={mode === item ? "active" : ""} key={item} onClick={() => setMode(item)}>{item === "tutor" ? <Bot size={17} /> : item === "explain" ? <BookOpen size={17} /> : <Brain size={17} />}{prompts[item].label}</button>)}
      </div>
      {configured === false && <div className="ai-notice"><Stethoscope size={18} /><div><strong>AI provider setup required</strong><p>The interface is ready, but responses will work after AI_API_KEY is configured in the server environment. Never put the key in frontend variables.</p></div></div>}
      <div className="ai-chat" aria-live="polite">
        {messages.length === 0 ? <div className="ai-empty"><div className="ai-orb"><Bot size={28} /></div><h2>What are you studying today?</h2><p>Ask a question, or add a short excerpt from your lecture to ground the explanation.</p><div className="ai-suggestions">{["Explain a difficult concept step by step", "Compare two similar drug classes", "Make a short self-test from my notes"].map((suggestion) => <button type="button" key={suggestion} onClick={() => setMessage(suggestion)}>{suggestion}</button>)}</div></div> : messages.map((item, index) => <article key={`${item.role}-${index}`} className={`ai-message ${item.role}`}><span className="ai-message-icon">{item.role === "assistant" ? <Bot size={16} /> : "You"}</span><div className="ai-message-text">{item.text}</div></article>)}
        {busy && <div className="ai-thinking"><span /><span /><span /> Thinking through your question…</div>}
      </div>
      <form className="ai-compose" onSubmit={(event) => void submit(event)}>
        <label htmlFor="ai-context">Course notes or source context <span>optional · avoid personal patient information</span></label>
        <textarea id="ai-context" value={context} onChange={(event) => setContext(event.target.value)} rows={3} maxLength={8000} placeholder="Paste a short excerpt from your lecture, including a reference or page number if available…" />
        <div className="ai-compose-row"><textarea aria-label="Your question" value={message} onChange={(event) => setMessage(event.target.value)} rows={2} maxLength={4000} placeholder={prompts[mode].placeholder} required /><button type="submit" disabled={busy || message.trim().length < 2} aria-label="Send question">{busy ? "…" : <Send size={18} />}</button></div>
        {error && <p className="ai-error" role="alert">{error}</p>}
        <p className="ai-disclaimer">Educational support only, not medical advice. Verify clinical and medication facts with trusted course references. Chats are not saved by this feature.</p>
      </form>
    </section>
  </main>;
}
