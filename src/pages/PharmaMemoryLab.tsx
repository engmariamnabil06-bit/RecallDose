import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Brain, Check, ChevronDown, Clock3, Layers3, Lightbulb, Pill, RotateCcw, Sparkles, Target, X } from "lucide-react";
import { Link } from "react-router-dom";

type DrugCard = {
  id: number;
  className: string;
  drug: string;
  prompt: string;
  answer: string;
  memoryCue: string;
  keyPoint: string;
  tags: string[];
};

const sampleCards: DrugCard[] = [
  {
    id: 1,
    className: "Beta blockers",
    drug: "Propranolol",
    prompt: "What is propranolol's mechanism of action?",
    answer: "A non-selective beta-adrenergic receptor antagonist (β₁ and β₂).",
    memoryCue: "Propranolol says: “Beta, both of you — sit this one out.”",
    keyPoint: "Non-selective: remember that β₂ blockade can cause bronchoconstriction. Check contraindications and course guidance before applying clinically.",
    tags: ["MOA", "Drug class", "High-yield"],
  },
  {
    id: 2,
    className: "Penicillins",
    drug: "Amoxicillin",
    prompt: "How do penicillins inhibit bacterial growth?",
    answer: "They bind penicillin-binding proteins and inhibit bacterial cell-wall peptidoglycan cross-linking.",
    memoryCue: "Imagine the bacteria's brick wall crew losing its cross-linking tool.",
    keyPoint: "The mnemonic is only a memory aid. Spectrum, resistance, allergy, and clinical use depend on the specific organism and context.",
    tags: ["MOA", "Antibiotics", "High-yield"],
  },
  {
    id: 3,
    className: "Loop diuretics",
    drug: "Furosemide",
    prompt: "Which transporter does furosemide inhibit?",
    answer: "The Na⁺-K⁺-2Cl⁻ cotransporter (NKCC2) in the thick ascending limb of the loop of Henle.",
    memoryCue: "LOOP: let sodium, potassium, and chloride leave the loop together — remember NKCC2.",
    keyPoint: "Loop diuretics can cause electrolyte disturbances; learn monitoring and adverse effects from your approved course source.",
    tags: ["MOA", "Renal", "Electrolytes"],
  },
];

const categories = ["All cards", "MOA", "Drug class", "High-yield", "Antibiotics", "Renal"];

export default function PharmaMemoryLab() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All cards");
  const [ratings, setRatings] = useState<Record<number, "easy" | "hard" | "again">>({});
  const [showCue, setShowCue] = useState(true);

  const cards = useMemo(() => selectedCategory === "All cards"
    ? sampleCards
    : sampleCards.filter((card) => card.tags.includes(selectedCategory)), [selectedCategory]);
  const safeIndex = Math.min(activeIndex, Math.max(cards.length - 1, 0));
  const card = cards[safeIndex];
  const ratedCount = Object.keys(ratings).length;

  const changeCategory = (category: string) => {
    setSelectedCategory(category);
    setActiveIndex(0);
    setRevealed(false);
  };

  const moveCard = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + cards.length) % cards.length);
    setRevealed(false);
  };

  const rateCard = (rating: "easy" | "hard" | "again") => {
    if (!card) return;
    setRatings((current) => ({ ...current, [card.id]: rating }));
    if (safeIndex < cards.length - 1) {
      setActiveIndex(safeIndex + 1);
      setRevealed(false);
    }
  };

  return (
    <main className="pharma-page">
      <div className="pharma-shell">
        <header className="pharma-topbar">
          <Link to="/dashboard" className="pharma-back"><ArrowLeft size={17} /> Dashboard</Link>
          <Link to="/" className="pharma-brand"><span className="pharma-brand-mark"><Pill size={19} /></span> RECALLDOSE</Link>
          <span className="pharma-preview-pill"><span /> Learning preview</span>
        </header>

        <section className="pharma-intro">
          <div className="pharma-eyebrow"><Sparkles size={15} /> PHARMA MEMORY LAB</div>
          <h1>Make the medicine <span>stick.</span></h1>
          <p>Understand it. Build a memory cue. Retrieve it again later. A calmer, more active way to study pharmacology.</p>
          <div className="pharma-intro-meta">
            <span><Layers3 size={15} /> Flashcards</span>
            <span><Lightbulb size={15} /> Mnemonics</span>
            <span><Brain size={15} /> Active recall</span>
          </div>
        </section>

        <section className="pharma-stats" aria-label="Study summary">
          <article className="pharma-stat"><span className="pharma-stat-icon"><Layers3 size={18} /></span><div><strong>{cards.length.toString().padStart(2, "0")}</strong><small>Cards in this set</small></div></article>
          <article className="pharma-stat"><span className="pharma-stat-icon"><Check size={18} /></span><div><strong>{ratedCount.toString().padStart(2, "0")}</strong><small>Cards self-rated</small></div></article>
          <article className="pharma-stat"><span className="pharma-stat-icon"><Clock3 size={18} /></span><div><strong>Active</strong><small>Recall mode</small></div></article>
        </section>

        <section className="pharma-workspace">
          <aside className="pharma-sidebar">
            <div className="pharma-section-label">YOUR STUDY SET</div>
            <h2>Drug flashcards</h2>
            <p className="pharma-sidebar-copy">Choose a topic to focus your recall.</p>
            <div className="pharma-category-list">
              {categories.map((category) => {
                const count = category === "All cards" ? sampleCards.length : sampleCards.filter((item) => item.tags.includes(category)).length;
                if (!count) return null;
                return <button key={category} className={`pharma-category ${selectedCategory === category ? "is-active" : ""}`} onClick={() => changeCategory(category)}><span>{category}</span><small>{count}</small></button>;
              })}
            </div>
            <div className="pharma-sidebar-note"><BookOpen size={17} /><p>Study tip: answer from memory before revealing the back of the card.</p></div>
          </aside>

          <div className="pharma-study-area">
            {card ? <>
              <div className="pharma-card-heading">
                <div><span className="pharma-section-label">CARD {String(safeIndex + 1).padStart(2, "0")} OF {String(cards.length).padStart(2, "0")}</span><h2>{card.className}</h2></div>
                <span className="pharma-topic-chip">{card.drug}</span>
              </div>

              <article className={`pharma-flashcard ${revealed ? "is-revealed" : ""}`}>
                <div className="pharma-card-topline"><span>{revealed ? "ANSWER" : "RECALL PROMPT"}</span><span><Pill size={15} /> PHARMA</span></div>
                {!revealed ? <div className="pharma-question-face"><span className="pharma-question-icon"><Target size={24} /></span><h3>{card.prompt}</h3><p>Say or write your answer before you reveal it.</p><button className="pharma-primary-btn" onClick={() => setRevealed(true)}>Reveal answer <ArrowRight size={16} /></button></div> : <div className="pharma-answer-face"><h3>{card.answer}</h3><div className="pharma-key-point"><strong>Key point</strong><p>{card.keyPoint}</p></div>{showCue && <div className="pharma-mnemonic"><div><Lightbulb size={17} /><strong>Memory cue</strong><span className="pharma-fun-label">A little memorable</span></div><p>{card.memoryCue}</p></div>}<button className="pharma-text-btn" onClick={() => setShowCue((value) => !value)}>{showCue ? "Hide" : "Show"} memory cue <ChevronDown size={15} /></button></div>}
                <div className="pharma-card-footer"><span>Learning aid · verify with your course source</span><button onClick={() => { setRevealed(false); setShowCue(true); }} aria-label="Reset flashcard"><RotateCcw size={16} /></button></div>
              </article>

              {revealed && <div className="pharma-rating-block"><div><h3>How well did you recall it?</h3><p>Your honest rating helps set the next review in the full product.</p></div><div className="pharma-rating-actions"><button className="rating-again" onClick={() => rateCard("again")}><X size={16} /> Forgot</button><button className="rating-hard" onClick={() => rateCard("hard")}><RotateCcw size={16} /> With effort</button><button className="rating-easy" onClick={() => rateCard("easy")}><Check size={16} /> Got it</button></div></div>}

              <div className="pharma-card-navigation"><button className="pharma-outline-btn" onClick={() => moveCard(-1)}><ArrowLeft size={16} /> Previous</button><div className="pharma-progress-dots">{cards.map((item, index) => <button key={item.id} aria-label={`Go to card ${index + 1}`} className={index === safeIndex ? "is-current" : ""} onClick={() => { setActiveIndex(index); setRevealed(false); }} />)}</div><button className="pharma-outline-btn" onClick={() => moveCard(1)}>Next <ArrowRight size={16} /></button></div>
            </> : <div className="pharma-empty-state">No cards in this filter yet. Try All cards.</div>}
          </div>
        </section>

        <footer className="pharma-disclaimer"><Brain size={17} /><p><strong>Built for learning, not clinical decisions.</strong> These are illustrative sample cards. Final medical content must be checked against trusted course references, and AI-generated mnemonics must never replace accurate drug facts.</p></footer>
      </div>
    </main>
  );
}
