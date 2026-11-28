import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Building2, CheckCircle2, Globe2, GraduationCap, Search, ShieldCheck } from "lucide-react";
import { apiUrl } from "../lib/api";
import { curriculumCategories, curriculumPrograms, curriculumRegions } from "../data/curriculumMap";
import "./curriculum-explorer.css";

const yearOptions = ["Year not selected", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Internship / clinical training", "Postgraduate / residency", "Continuing professional development"];

export default function CurriculumExplorer() {
  const [programId, setProgramId] = useState("medicine");
  const [category, setCategory] = useState("All programs");
  const [region, setRegion] = useState("Egypt");
  const [university, setUniversity] = useState("");
  const [year, setYear] = useState("Year not selected");
  const [specialty, setSpecialty] = useState("");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const visiblePrograms = useMemo(() => curriculumPrograms.filter((program) => category === "All programs" || program.category === category), [category]);
  const selected = curriculumPrograms.find((program) => program.id === programId) ?? curriculumPrograms[0];
  const subjects = useMemo(() => selected.subjects.filter((subject) => `${subject.name} ${subject.nameAr}`.toLowerCase().includes(query.trim().toLowerCase())), [selected, query]);

  async function saveCurriculum() {
    if (saving) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(apiUrl("/api/auth/profile"), {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university: university.trim(), faculty: selected.name, year: year === "Year not selected" ? "" : year, specialization: specialty }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not save your learning path.");
      setNotice("Your program and academic context were saved to your profile.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save your learning path."); }
    finally { setSaving(false); }
  }

  return <main className="curriculum-page">
    <header className="curriculum-top"><Link to="/dashboard"><ArrowLeft size={16}/> Dashboard</Link><span>RECALLDOSE · MEDICAL CURRICULA</span></header>
    <section className="curriculum-hero">
      <span className="curriculum-kicker"><GraduationCap size={15}/> MEDICAL & HEALTH-SCIENCE PROGRAMS</span>
      <h1>One platform. <span>Every health-science path.</span></h1>
      <p>Explore subjects and specialty tracks across medicine, dentistry, pharmacy, rehabilitation, nursing, veterinary medicine, applied health sciences and related medical fields.</p>
      <div className="curriculum-hero-count"><strong>{curriculumPrograms.length}</strong><span>programs and study pathways in the starter catalog</span></div>
    </section>
    <section className="curriculum-config" aria-label="Curriculum selection">
      <label><span><BookOpen size={15}/> Program category</span><select value={category} onChange={(event)=>{const value=event.target.value;setCategory(value);const first=curriculumPrograms.find((p)=>value==="All programs"||p.category===value);if(first)setProgramId(first.id);setSpecialty("");}}>{curriculumCategories.map((item)=><option key={item}>{item}</option>)}</select></label>
      <label><span><BookOpen size={15}/> Program / faculty</span><select value={programId} onChange={(event)=>{setProgramId(event.target.value);setSpecialty("");}}>{visiblePrograms.map((program)=><option key={program.id} value={program.id}>{program.name} — {program.nameAr}</option>)}</select></label>
      <label><span><Globe2 size={15}/> Country / curriculum family</span><select value={region} onChange={(event)=>setRegion(event.target.value)}>{curriculumRegions.map((item)=><option key={item}>{item}</option>)}</select></label>
      <label><span><Building2 size={15}/> University / institution</span><input value={university} onChange={(event)=>setUniversity(event.target.value)} maxLength={120} placeholder="Enter your university (optional)"/></label>
      <label><span><GraduationCap size={15}/> Academic year / stage</span><select value={year} onChange={(event)=>setYear(event.target.value)}>{yearOptions.map((item)=><option key={item}>{item}</option>)}</select></label>
      <label><span><GraduationCap size={15}/> Specialty / track (optional)</span><select value={specialty} onChange={(event)=>setSpecialty(event.target.value)}><option value="">Not selected</option>{selected.specialties.map((item)=><option key={item}>{item}</option>)}</select></label>
    </section>
    <section className="curriculum-results">
      <div className="curriculum-results-head"><div><span className="curriculum-kicker">{selected.category.toUpperCase()} · STARTER SUBJECT MAP</span><h2>{selected.name} <span className="curriculum-arabic-title">{selected.nameAr}</span></h2><p>{selected.duration}</p></div><span className="curriculum-count">{selected.subjects.length} subjects</span></div>
      <div className="curriculum-search"><Search size={17}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search subjects in English or Arabic…"/></div>
      <div className="curriculum-subjects">{subjects.map((subject)=><article key={subject.name}><BookOpen size={17}/><div><strong>{subject.name}</strong><span dir="rtl">{subject.nameAr}</span><Link to="/ai-tutor" state={{mode:"tutor",message:`Teach me ${subject.name} from the ${selected.name} program at ${year}. Start with the foundations, then test my understanding.`,context:`Program: ${selected.name} (${selected.nameAr})\nUniversity: ${university || "Not specified"}\nAcademic stage: ${year}\nSubject: ${subject.name} (${subject.nameAr})\nSpecialty: ${specialty || "Not specified"}\nCountry/curriculum family: ${region}. This is a study context, not an official syllabus.`}}>Study with AI <span>↗</span></Link></div><span className="curriculum-arrow">↗</span></article>)}</div>
      {subjects.length===0 && <p className="curriculum-empty">No matching subjects. Try another search.</p>}
      <div className="curriculum-specialties"><div><span className="curriculum-kicker">SPECIALTY TRACKS</span><strong>{selected.specialties.length} common tracks</strong></div><div className="curriculum-specialty-chips">{selected.specialties.map((item)=><span key={item}>{item}</span>)}</div></div>
      <div className="curriculum-save-row"><div>{notice && <p className="curriculum-success" role="status"><CheckCircle2 size={16}/>{notice}</p>}{error && <p className="curriculum-error" role="alert">{error}</p>}</div><button type="button" onClick={()=>void saveCurriculum()} disabled={saving}>{saving ? "Saving…" : "Save my learning path"}</button></div>
    </section>
    <aside className="curriculum-note"><ShieldCheck size={21}/><div><strong>Curriculum accuracy note</strong><p>{university.trim() ? `Selected context: ${university.trim()} · ${region} · ${year}. ` : `Selected context: ${region} · ${year}. `}This is a broad starter catalog, not an official or exhaustive syllabus for every university. Some pathways are departments or tracks within larger faculties rather than standalone colleges. Each institution's course sequence, credit hours, outcomes and specialty requirements must be verified against its current official study plan.</p></div></aside>
  </main>;
}
