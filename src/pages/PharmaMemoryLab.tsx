import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Layers3, RotateCcw, Sparkles, Target, X } from "lucide-react";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

type StudyCard = {
  id: string;
  front: string;
  back: string;
  subject: string;
  reviewCount: number;
  easeFactor: number;
  intervalDays: number;
  lastRating: string | null;
  nextReviewAt: string | null;
};

type Rating = "again" | "hard" | "easy";

export default function PharmaMemoryLab() {
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("All subjects");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(apiUrl("/api/study-tools/cards"), { credentials: "include" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "Could not load your saved flashcards.");
        const loaded = Array.isArray(payload.cards) ? payload.cards as StudyCard[] : [];
        loaded.sort((a, b) => {
          const aDue = a.nextReviewAt ? Date.parse(a.nextReviewAt) : 0;
          const bDue = b.nextReviewAt ? Date.parse(b.nextReviewAt) : 0;
          return aDue - bDue;
        });
        if (active) setCards(loaded);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load your cards.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  const subjects = useMemo(() => ["All subjects", ...Array.from(new Set(cards.map((card) => card.subject || "General")))], [cards]);
  const filtered = useMemo(() => filter === "All subjects" ? cards : cards.filter((card) => (card.subject || "General") === filter), [cards, filter]);
  const safeIndex = Math.min(activeIndex, Math.max(0, filtered.length - 1));
  const card = filtered[safeIndex];
  const dueCount = cards.filter((item) => !item.nextReviewAt || Date.parse(item.nextReviewAt) <= Date.now()).length;

  function move(direction: -1 | 1) {
    if (!filtered.length) return;
    setActiveIndex((index) => (index + direction + filtered.length) % filtered.length);
    setRevealed(false); setNotice("");
  }

  async function rate(rating: Rating) {
    if (!card || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(apiUrl(`/api/study-tools/cards/${card.id}/review`), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not save your review.");
      setCards((current) => current.map((item) => item.id === card.id ? { ...item, ...payload.card } : item));
      setNotice(`Saved. Review this card again in ${payload.intervalDays} day(s).`);
      setRevealed(false);
      if (safeIndex < filtered.length - 1) setActiveIndex(safeIndex + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your review.");
    } finally { setBusy(false); }
  }

  return <main className="pharma-page">
    <div className="pharma-shell">
      <header className="pharma-topbar">
        <Link to="/dashboard" className="pharma-back"><ArrowLeft size={17}/> Dashboard</Link>
        <Link to="/" className="pharma-brand"><span className="pharma-brand-mark">R</span> RECALLDOSE</Link>
        <span className="pharma-preview-pill"><span/> Account-backed review</span>
      </header>
      <section className="pharma-intro">
        <div className="pharma-eyebrow"><Sparkles size={15}/> PHARMA MEMORY LAB</div>
        <h1>Make the medicine <span>stick.</span></h1>
        <p>Review your own saved flashcards. Each confidence rating updates its next review date in your account.</p>
        <div className="pharma-intro-meta"><span><Layers3 size={15}/> Saved cards</span><span><RotateCcw size={15}/> Spaced review</span><span><Target size={15}/> Active recall</span></div>
      </section>
      <section className="pharma-stats" aria-label="Study summary">
        <article className="pharma-stat"><span className="pharma-stat-icon"><Layers3 size={18}/></span><div><strong>{cards.length.toString().padStart(2,"0")}</strong><small>Saved cards</small></div></article>
        <article className="pharma-stat"><span className="pharma-stat-icon"><Clock3 size={18}/></span><div><strong>{dueCount.toString().padStart(2,"0")}</strong><small>Due for review</small></div></article>
        <article className="pharma-stat"><span className="pharma-stat-icon"><Check size={18}/></span><div><strong>{cards.reduce((sum,item)=>sum+item.reviewCount,0).toString().padStart(2,"0")}</strong><small>Reviews recorded</small></div></article>
      </section>
      <section className="pharma-workspace">
        <aside className="pharma-sidebar">
          <div className="pharma-section-label">YOUR STUDY SET</div><h2>Saved flashcards</h2><p className="pharma-sidebar-copy">The review queue is personal to your signed-in account.</p>
          <div className="pharma-category-list">{subjects.map((subject) => <button key={subject} className={`pharma-category ${filter === subject ? "is-active" : ""}`} onClick={() => {setFilter(subject);setActiveIndex(0);setRevealed(false);}}><span>{subject}</span><small>{subject === "All subjects" ? cards.length : cards.filter((item)=> (item.subject || "General")===subject).length}</small></button>)}</div>
          <div className="pharma-sidebar-note"><BookOpen size={17}/><p>Study tip: try to recall the answer before revealing it.</p></div>
          <Link to="/study-tools" className="pharma-outline-btn">Manage flashcards <ArrowRight size={15}/></Link>
        </aside>
        <div className="pharma-study-area">
          {loading ? <div className="pharma-empty-state">Loading your saved cards…</div> : error && cards.length === 0 ? <div className="pharma-empty-state">{error}</div> : card ? <>
            <div className="pharma-card-heading"><div><span className="pharma-section-label">CARD {String(safeIndex+1).padStart(2,"0")} OF {String(filtered.length).padStart(2,"0")}</span><h2>{card.subject || "General"}</h2></div><span className="pharma-topic-chip">{card.reviewCount} reviews</span></div>
            <article className={`pharma-flashcard ${revealed ? "is-revealed" : ""}`}>
              <div className="pharma-card-topline"><span>{revealed ? "ANSWER" : "RECALL PROMPT"}</span><span><BookOpen size={15}/> SAVED CARD</span></div>
              {!revealed ? <div className="pharma-question-face"><span className="pharma-question-icon"><Target size={24}/></span><h3>{card.front}</h3><p>Think of your answer before revealing the back of the card.</p><button className="pharma-primary-btn" onClick={()=>setRevealed(true)}>Reveal answer <ArrowRight size={16}/></button></div> : <div className="pharma-answer-face"><h3>{card.back}</h3><div className="pharma-key-point"><strong>Next review</strong><p>{card.nextReviewAt ? new Date(card.nextReviewAt).toLocaleString() : "Not scheduled yet. Rate your recall below."}</p></div><div className="pharma-mnemonic"><div><Clock3 size={17}/><strong>Review interval</strong></div><p>{card.intervalDays ? `${card.intervalDays} day(s)` : "First review"}</p></div></div>}
              <div className="pharma-card-footer"><span>Stored in your account · educational aid</span><button onClick={()=>setRevealed(false)} aria-label="Hide answer"><RotateCcw size={16}/></button></div>
            </article>
            {revealed && <div className="pharma-rating-block"><div><h3>How well did you remember it?</h3><p>Your rating sets the next review interval.</p></div><div className="pharma-rating-actions"><button disabled={busy} className="rating-again" onClick={()=>void rate("again")}><X size={16}/> Forgot</button><button disabled={busy} className="rating-hard" onClick={()=>void rate("hard")}><RotateCcw size={16}/> With effort</button><button disabled={busy} className="rating-easy" onClick={()=>void rate("easy")}><Check size={16}/> Got it</button></div></div>}
            <div className="pharma-card-navigation"><button className="pharma-outline-btn" onClick={()=>move(-1)}><ArrowLeft size={16}/> Previous</button><div className="pharma-progress-dots">{filtered.map((item,index)=><button key={item.id} aria-label={`Go to card ${index+1}`} className={index===safeIndex?"is-current":""} onClick={()=>{setActiveIndex(index);setRevealed(false);}}/>)}</div><button className="pharma-outline-btn" onClick={()=>move(1)}>Next <ArrowRight size={16}/></button></div>
          </> : <div className="pharma-empty-state"><h3>No saved flashcards yet</h3><p>Create your first card in Study Tools. It will appear here automatically and its review history will be saved to your account.</p><Link to="/study-tools" className="pharma-primary-btn">Create flashcards <ArrowRight size={16}/></Link></div>}
          {notice && <p className="insight-success" role="status">{notice}</p>}
          {error && <p className="insight-error" role="alert">{error}</p>}
        </div>
      </section>
      <footer className="pharma-disclaimer"><BookOpen size={17}/><p><strong>Built for learning, not clinical decisions.</strong> Add content from trusted course references and verify medication facts before relying on them.</p></footer>
    </div>
  </main>;
}
