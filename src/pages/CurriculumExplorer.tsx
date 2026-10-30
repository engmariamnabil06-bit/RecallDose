import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Building2, Globe2, GraduationCap, Search, ShieldCheck } from "lucide-react";
import { curriculumPrograms, curriculumRegions } from "../data/curriculumMap";
import "./curriculum-explorer.css";

export default function CurriculumExplorer() {
  const [programId, setProgramId] = useState("medicine");
  const [region, setRegion] = useState("Egypt");
  const [university, setUniversity] = useState("");
  const [year, setYear] = useState("Year not selected");
  const [query, setQuery] = useState("");
  const selected = curriculumPrograms.find((program) => program.id === programId) ?? curriculumPrograms[0];
  const subjects = useMemo(() => selected.subjects.filter((subject) => subject.toLowerCase().includes(query.trim().toLowerCase())), [selected, query]);
  return <main className="curriculum-page">
    <header className="curriculum-top"><Link to="/dashboard"><ArrowLeft size={16} /> Dashboard</Link><span>RECALLDOSE · CURRICULUM</span></header>
    <section className="curriculum-hero"><span className="curriculum-kicker"><GraduationCap size={15} /> YOUR LEARNING MAP</span><h1>One platform. <span>Every health-science path.</span></h1><p>Choose a program and study context. Recalldose is being designed to map learning content to the right curriculum—not assume every university teaches the same sequence.</p></section>
    <section className="curriculum-config" aria-label="Curriculum selection">
      <label><span><BookOpen size={15} /> Program / specialization</span><select value={programId} onChange={(event) => setProgramId(event.target.value)}>{curriculumPrograms.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></label>
      <label><span><Globe2 size={15} /> Country / curriculum family</span><select value={region} onChange={(event) => setRegion(event.target.value)}>{curriculumRegions.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span><Building2 size={15} /> University / institution</span><input value={university} onChange={(event) => setUniversity(event.target.value)} maxLength={120} placeholder="Enter your university (optional)" /></label>
      <label><span><GraduationCap size={15} /> Academic year / stage</span><select value={year} onChange={(event) => setYear(event.target.value)}>{["Year not selected","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Internship / clinical training","Postgraduate / residency","Continuing professional development"].map((item) => <option key={item}>{item}</option>)}</select></label>
    </section>
    <section className="curriculum-results">
      <div className="curriculum-results-head"><div><span className="curriculum-kicker">STARTER SUBJECT MAP</span><h2>{selected.name}</h2><p>{selected.duration}</p></div><span className="curriculum-count">{selected.subjects.length} subject areas</span></div>
      <div className="curriculum-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subject areas…" /></div>
      <div className="curriculum-subjects">{subjects.map((subject) => <article key={subject}><BookOpen size={17} /><div><strong>{subject}</strong><span>Subject area · {region}</span></div><span className="curriculum-arrow">↗</span></article>)}</div>
      {subjects.length === 0 && <p className="curriculum-empty">No matching subject areas. Try another search.</p>}
    </section>
    <aside className="curriculum-note"><ShieldCheck size={21} /><div><strong>Important: this is a starter taxonomy, not an official curriculum.</strong><p>{university.trim() ? `Selected context: ${university.trim()} · ${region} · ${year}. ` : `Selected context: ${region} · ${year}. `}The university-specific course sequence, learning outcomes, readings, and assessment blueprint still need to be added and verified. The selection is not yet saved to your account.</p></div></aside>
  </main>;
}
