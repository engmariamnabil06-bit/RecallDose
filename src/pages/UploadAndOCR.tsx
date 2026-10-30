import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, Image as ImageIcon, LoaderCircle, ScanText, Send, UploadCloud } from "lucide-react";
import { apiUrl } from "../lib/api";
import "./upload-ocr.css";

type Uploaded = { id: string; originalName: string; status: string; uploadedAt?: string; sizeBytes?: string };
export default function UploadAndOCR() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState("");
  const [method, setMethod] = useState("");
  const [uploads, setUploads] = useState<Uploaded[]>([]);
  useEffect(() => {
    fetch(apiUrl("/api/study-tools/uploads"), { credentials: "include" }).then(async r => { const data = await r.json().catch(() => ({})); if (r.ok) setUploads(data.uploads || []); }).catch(() => undefined);
  }, []);
  async function openExisting(item: Uploaded) {
    setError(""); setNotice(""); setExtracted("");
    try {
      const response = await fetch(apiUrl(`/api/study-tools/uploads/${item.id}/text`), { credentials: "include" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not open extracted text.");
      setExtracted(data.extractedText || ""); setMethod("saved extraction");
      setNotice(data.hasText ? "Loaded previously extracted text." : "No extracted text is saved for this file. Upload it again after checking the scan quality.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not open this file."); }
  }
  async function processFile() {
    if (!file || busy) return;
    setBusy(true); setError(""); setNotice(""); setExtracted("");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch(apiUrl("/api/study-tools/upload"), { method: "POST", credentials: "include", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Upload or text extraction failed.");
      setExtracted(data.upload?.extractedText || ""); setMethod(data.upload?.extractionMethod || ""); setNotice(data.upload?.hasText ? "File uploaded and text extracted. Review the extracted text before using it." : "File uploaded, but no readable text was found. Try a clearer scan or a text-based PDF.");
      setUploads(old => [{ id: data.upload.id, originalName: data.upload.originalName, status: data.upload.status }, ...old.filter(item => item.id !== data.upload.id)]); setFile(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); }
    finally { setBusy(false); }
  }
  return <main className="uo-page"><header className="uo-top"><Link to="/study-tools"><ArrowLeft size={16}/> Study workspace</Link><span className="uo-brand"><span>R</span> RECALLDOSE</span></header><section className="uo-shell"><div className="uo-heading"><span className="uo-kicker"><ScanText size={15}/> LECTURE IMPORT</span><h1>Turn your notes into <em>understanding.</em></h1><p>Upload a lecture or an image, extract its text, review it, then send the material to AI Tutor.</p></div><section className="uo-panel"><div className="uo-file-icons"><span><FileText size={22}/></span><span><ImageIcon size={22}/></span><span><ScanText size={22}/></span></div><h2>Upload a lecture or study image</h2><p>Supported: PDF, PNG, JPG, WEBP, TXT and MD · maximum 12 MB per file.</p><label className="uo-drop"><UploadCloud size={28}/><strong>{file ? file.name : "Choose a file from your device"}</strong><span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Text-based PDF extraction and English image OCR"}</span><input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,application/pdf,image/png,image/jpeg,image/webp,text/plain,text/markdown" onChange={e => { setFile(e.target.files?.[0] || null); setError(""); setNotice(""); }} /></label><button className="uo-primary" disabled={!file || busy} onClick={() => void processFile()}>{busy ? <><LoaderCircle className="uo-spin" size={18}/> Uploading and extracting…</> : <><ScanText size={18}/> Upload and extract text</>}</button>{notice && <div className="uo-notice"><CheckCircle2 size={18}/>{notice}</div>}{error && <div className="uo-error" role="alert">{error}</div>}</section>{extracted && <section className="uo-panel"><div className="uo-result-head"><div><h2>Extracted text</h2><p>Method: {method}. Check names, numbers, symbols and drug details against the original.</p></div><button className="uo-primary" onClick={() => navigate("/ai-tutor", { state: { context: `Extracted lecture content (${method}). Verify the source before relying on it:\n\n${extracted.slice(0, 8000)}` } })}><Send size={16}/> Study with AI</button></div><textarea className="uo-extracted" value={extracted} onChange={e => setExtracted(e.target.value)} maxLength={100000} rows={12} aria-label="Review extracted text" /></section>}<section className="uo-panel"><h2>Your uploaded files</h2><p>Only files belonging to your signed-in account should appear here.</p>{uploads.length ? <div className="uo-list">{uploads.map(item => <article key={item.id}><FileText size={18}/><div><strong>{item.originalName}</strong><small>{item.status}</small></div><button className="uo-open" onClick={() => void openExisting(item)}>Open text</button></article>)}</div> : <div className="uo-empty">Your uploaded lecture files will appear here after a successful upload.</div>}</section><p className="uo-privacy">Privacy and accuracy: do not upload patient-identifiable information. OCR can misread medical terms, formulas, and drug names; always verify extracted text with the original lecture. Local-disk uploads require persistent storage configuration before production deployment.</p></section></main>;
}
