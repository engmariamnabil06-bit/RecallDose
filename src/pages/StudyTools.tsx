import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { apiUrl } from "../lib/api";
import { ArrowLeft, BookOpen, Brain, Check, ChevronLeft, ChevronRight, FileText, Layers, Plus, Send, Trash2, Upload, X } from "lucide-react";
import "./study-tools.css";

type Note = { id: string; title: string; subject: string; content: string; updatedAt: string };
type Flashcard = { id: string; front: string; back: string; subject: string; createdAt: string };
const NOTES_KEY = "recalldose.study-tools.notes.v1";
const CARDS_KEY = "recalldose.study-tools.flashcards.v1";
function read<T,>(key: string): T[] { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T[] : []; } catch { return []; } }
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

export default function StudyTools() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"notes" | "cards">("notes");
  const [notes, setNotes] = useState<Note[]>(() => read<Note>(NOTES_KEY));
  const [cards, setCards] = useState<Flashcard[]>(() => read<Flashcard>(CARDS_KEY));
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [content, setContent] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [cardSubject, setCardSubject] = useState("General");
  const [activeCard, setActiveCard] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [notice, setNotice] = useState("");
  const currentCard = cards.length ? cards[activeCard % cards.length] : null;
  const subjectOptions = useMemo(() => ["General", "Anatomy", "Physiology", "Pharmacology", "Biochemistry", "Pathology", "Microbiology", "Other"], []);

  useEffect(() => {
    let alive = true;
    fetch(apiUrl("/api/study-tools/notes"), { credentials: "include" }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (alive && response.ok && Array.isArray(data.notes)) { setNotes(data.notes); localStorage.setItem(NOTES_KEY, JSON.stringify(data.notes)); }
    }).catch(() => undefined);
    fetch(apiUrl("/api/study-tools/cards"), { credentials: "include" }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (alive && response.ok && Array.isArray(data.cards)) { setCards(data.cards); localStorage.setItem(CARDS_KEY, JSON.stringify(data.cards)); }
    }).catch(() => undefined);
    return () => { alive = false; };
  }, []);

  function saveNotes(next: Note[]) {
    setNotes(next); localStorage.setItem(NOTES_KEY, JSON.stringify(next));
    void fetch(apiUrl("/api/study-tools/notes/sync"), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: next }) }).then(async response => { if (!response.ok) { const data = await response.json().catch(() => ({})); setNotice(data.message || "Saved on this browser, but account sync failed."); } }).catch(() => setNotice("Saved on this browser; sign in and check the server to sync across devices."));
  }
  function saveCards(next: Flashcard[]) {
    setCards(next); localStorage.setItem(CARDS_KEY, JSON.stringify(next));
    void fetch(apiUrl("/api/study-tools/cards/sync"), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cards: next }) }).then(async response => { if (!response.ok) { const data = await response.json().catch(() => ({})); setNotice(data.message || "Saved on this browser, but account sync failed."); } }).catch(() => setNotice("Saved on this browser; sign in and check the server to sync across devices."));
  }
  function addNote(event: FormEvent) { event.preventDefault(); if (!title.trim() || !content.trim()) return; saveNotes([{ id: uid(), title: title.trim(), subject, content: content.trim(), updatedAt: new Date().toISOString() }, ...notes]); setTitle(""); setContent(""); setNotice("Note saved on this browser."); }
  function addCard(event: FormEvent) { event.preventDefault(); if (!front.trim() || !back.trim()) return; saveCards([{ id: uid(), front: front.trim(), back: back.trim(), subject: cardSubject, createdAt: new Date().toISOString() }, ...cards]); setFront(""); setBack(""); setNotice("Flashcard added to your deck."); }
  async function importText(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; if (!/\.(txt|md|csv)$/i.test(file.name)) { setNotice("For now, import .txt, .md, or .csv text files. PDF/image OCR is not implemented yet."); event.target.value = ""; return; } if (file.size > 1_000_000) { setNotice("Please choose a text file smaller than 1 MB."); event.target.value = ""; return; } const text = await file.text(); setTitle(file.name.replace(/\.[^.]+$/, "")); setContent(text); setTab("notes"); setNotice("Text loaded into the editor. Review it and press Save note."); event.target.value = ""; }
  function sendNoteToAI(note: Note) { navigate("/ai-tutor", { state: { context: `Study note: ${note.title}\nSubject: ${note.subject}\n\n${note.content}` } }); }

  return <main className="st-page"><header className="st-top"><Link to="/dashboard" className="st-back"><ArrowLeft size={16}/> Dashboard</Link><div className="st-brand"><span>R</span> RECALLDOSE</div><Link to="/upload-ocr" className="st-back"><Upload size={16}/> Upload lecture</Link></header><div className="st-shell"><div className="st-heading"><span className="st-eyebrow"><Brain size={15}/> YOUR PERSONAL STUDY WORKSPACE</span><h1>Make knowledge <em>stick.</em></h1><p>Keep your own study notes and turn the hardest facts into active-recall flashcards.</p></div>
    <div className="st-tabs"><button className={tab === "notes" ? "active" : ""} onClick={() => { setTab("notes"); setNotice(""); }}><FileText size={17}/> Notes <span>{notes.length}</span></button><button className={tab === "cards" ? "active" : ""} onClick={() => { setTab("cards"); setNotice(""); }}><Layers size={17}/> Flashcards <span>{cards.length}</span></button></div>
    {notice && <div className="st-notice"><Check size={16}/>{notice}<button aria-label="Dismiss" onClick={() => setNotice("")}><X size={14}/></button></div>}
    {tab === "notes" ? <div className="st-layout"><section className="st-panel"><div className="st-panel-head"><div><h2><Plus size={19}/> Create a note</h2><p>Write a summary or upload a PDF/image to extract its text.</p></div><div className="st-import-actions"><label className="st-import"><Upload size={16}/> Import text<input type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" onChange={importText}/></label><Link className="st-import" to="/upload-ocr"><Upload size={16}/> PDF / Image OCR</Link></div></div><form onSubmit={addNote} className="st-form"><label>Note title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Beta blockers — key facts" maxLength={120} required/></label><label>Subject<select value={subject} onChange={e => setSubject(e.target.value)}>{subjectOptions.map(s => <option key={s}>{s}</option>)}</select></label><label>Study content<textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Add your own notes, lecture summary, or key concepts…" rows={8} maxLength={30000} required/></label><div className="st-form-foot"><small>{content.length.toLocaleString()} / 30,000 characters</small><button className="st-primary" type="submit"><Check size={16}/> Save note</button></div></form></section><section className="st-panel"><div className="st-panel-head"><div><h2><BookOpen size={19}/> Saved notes</h2><p>Saved locally first, with account sync when signed in and the API is available.</p></div></div>{notes.length ? <div className="st-note-list">{notes.map(note => <article className="st-note-item" key={note.id}><div className="st-note-meta"><span>{note.subject}</span><time>{new Date(note.updatedAt).toLocaleDateString()}</time></div><h3>{note.title}</h3><p>{note.content.slice(0, 180)}{note.content.length > 180 ? "…" : ""}</p><div className="st-note-actions"><button onClick={() => sendNoteToAI(note)}><Send size={14}/> Explain with AI</button><button className="danger" aria-label={`Delete ${note.title}`} onClick={() => saveNotes(notes.filter(n => n.id !== note.id))}><Trash2 size={14}/> Delete</button></div></article>)}</div> : <div className="st-empty"><FileText size={28}/><strong>No notes yet</strong><p>Create your first note or import a .txt, .md, or .csv file.</p></div>}</section></div> : <div className="st-layout st-card-layout"><section className="st-panel"><div className="st-panel-head"><div><h2><Plus size={19}/> Build a flashcard</h2><p>Use a question on the front and the answer on the back.</p></div></div><form onSubmit={addCard} className="st-form"><label>Subject<select value={cardSubject} onChange={e => setCardSubject(e.target.value)}>{subjectOptions.map(s => <option key={s}>{s}</option>)}</select></label><label>Front — prompt<input value={front} onChange={e => setFront(e.target.value)} placeholder="What is the mechanism of action?" maxLength={500} required/></label><label>Back — answer<textarea value={back} onChange={e => setBack(e.target.value)} placeholder="Write the answer in your own words…" rows={4} maxLength={3000} required/></label><button className="st-primary" type="submit"><Plus size={16}/> Add flashcard</button></form></section><section className="st-panel st-review-panel"><div className="st-panel-head"><div><h2><Brain size={19}/> Active recall</h2><p>{cards.length ? `${activeCard + 1} of ${cards.length} cards` : "Your review deck will appear here."}</p></div></div>{currentCard ? <><div className="st-flashcard" role="button" tabIndex={0} onClick={() => setRevealed(v => !v)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setRevealed(v => !v); } }}><span className="st-card-subject">{currentCard.subject}</span><small>{revealed ? "ANSWER" : "QUESTION · TAP TO REVEAL"}</small><strong>{revealed ? currentCard.back : currentCard.front}</strong><span className="st-flip-hint">{revealed ? "Tap to see question" : "Reveal answer"}</span></div><div className="st-review-controls"><button disabled={cards.length < 2} onClick={() => { setActiveCard(i => (i - 1 + cards.length) % cards.length); setRevealed(false); }}><ChevronLeft size={18}/> Previous</button><button disabled={cards.length < 2} onClick={() => { setActiveCard(i => (i + 1) % cards.length); setRevealed(false); }}>Next <ChevronRight size={18}/></button></div><div className="st-card-bottom"><span>Keep it honest: try to recall before revealing.</span><button className="danger" onClick={() => { const next = cards.filter(c => c.id !== currentCard.id); saveCards(next); setActiveCard(0); setRevealed(false); }}><Trash2 size={14}/> Delete card</button></div></> : <div className="st-empty"><Layers size={28}/><strong>Your deck is empty</strong><p>Add a few cards, then test yourself without looking at the answer.</p></div>}</section></div>}
    <p className="st-privacy"><strong>Privacy note:</strong> Notes and flashcards are cached in this browser and synced to the server when signed in. Server storage currently uses local JSON files and needs persistent disk or database migration before production. Don’t store patient-identifiable information here.</p>
  </div></main>;
}
