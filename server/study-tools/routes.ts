import { Router, type Request } from "express";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";
import { db } from "../db";
import { getSessionUser } from "../auth/sessionUser";

const router = Router();
const here = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(process.env.UPLOAD_DIR || path.join(here, "../../uploads"));
const dataRoot = path.resolve(process.env.STUDY_DATA_DIR || path.join(here, "../../study-data"));
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const allowedExtensions = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt", ".md"]);
const storage = multer.diskStorage({
  destination: async (_req, _file, callback) => {
    try { await fs.mkdir(uploadRoot, { recursive: true }); callback(null, uploadRoot); }
    catch (error) { callback(error as Error, uploadRoot); }
  },
  filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMime = ["application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain", "text/markdown"];
    if (!allowedExtensions.has(ext) || !allowedMime.includes(file.mimetype)) return callback(new Error("Unsupported file type. Upload PDF, PNG, JPG, WEBP, TXT or MD."));
    callback(null, true);
  },
});

type StudyNote = { id: string; title: string; subject: string; content: string; updatedAt: string };
type StudyCard = { id: string; front: string; back: string; subject: string; createdAt: string };
type StudyData = { notes: StudyNote[]; cards: StudyCard[] };

function tokenFrom(req: Request): string | null {
  const part = req.headers.cookie?.split(";").find((value) => value.trim().startsWith("session="));
  if (!part) return null;
  try { return decodeURIComponent(part.trim().slice("session=".length)); } catch { return null; }
}
async function userFor(req: Request) {
  const token = tokenFrom(req);
  return token ? getSessionUser(token) : null;
}
function safeId(value: unknown) { return typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value); }
async function dataPath(userId: string) {
  await fs.mkdir(dataRoot, { recursive: true });
  return path.join(dataRoot, `${crypto.createHash("sha256").update(userId).digest("hex")}.json`);
}
async function readData(userId: string): Promise<StudyData> {
  try { return JSON.parse(await fs.readFile(await dataPath(userId), "utf8")) as StudyData; }
  catch { return { notes: [], cards: [] }; }
}
async function writeData(userId: string, data: StudyData) {
  const file = await dataPath(userId);
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temp, JSON.stringify(data), { encoding: "utf8", mode: 0o600 });
  await fs.rename(temp, file);
}
async function extractText(filePath: string, ext: string): Promise<{ text: string; method: string }> {
  if (ext === ".txt" || ext === ".md") return { text: (await fs.readFile(filePath, "utf8")).slice(0, 200_000), method: "text-file" };
  if (ext === ".pdf") {
    const parsed = await pdfParse(await fs.readFile(filePath));
    return { text: (parsed.text || "").trim().slice(0, 200_000), method: "pdf-text-extraction" };
  }
  const worker = await createWorker("eng");
  try {
    const result = await worker.recognize(filePath);
    return { text: (result.data.text || "").trim().slice(0, 100_000), method: "image-ocr-eng" };
  } finally { await worker.terminate(); }
}

router.put("/notes/sync", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  const notes = req.body?.notes;
  if (!Array.isArray(notes) || notes.length > 500 || notes.some((n: any) => !n || typeof n.id !== "string" || typeof n.title !== "string" || n.title.length > 120 || typeof n.subject !== "string" || typeof n.content !== "string" || n.content.length > 30000 || typeof n.updatedAt !== "string")) return res.status(400).json({ message: "Invalid notes payload." });
  const data = await readData(user.id); data.notes = notes.map((n: any) => ({ id: n.id, title: n.title, subject: n.subject, content: n.content, updatedAt: n.updatedAt })); await writeData(user.id, data); return res.json({ notes: data.notes });
});
router.put("/cards/sync", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  const cards = req.body?.cards;
  if (!Array.isArray(cards) || cards.length > 1000 || cards.some((c: any) => !c || typeof c.id !== "string" || typeof c.front !== "string" || c.front.length > 500 || typeof c.back !== "string" || c.back.length > 3000 || typeof c.subject !== "string" || typeof c.createdAt !== "string")) return res.status(400).json({ message: "Invalid flashcards payload." });
  const data = await readData(user.id); data.cards = cards.map((c: any) => ({ id: c.id, front: c.front, back: c.back, subject: c.subject, createdAt: c.createdAt })); await writeData(user.id, data); return res.json({ cards: data.cards });
});

router.get("/notes", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  const data = await readData(user.id); return res.json({ notes: data.notes });
});
router.post("/notes", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  const { title, subject, content, id } = req.body ?? {};
  if (typeof title !== "string" || !title.trim() || title.length > 120 || typeof content !== "string" || !content.trim() || content.length > 30000 || typeof subject !== "string" || subject.length > 100) return res.status(400).json({ message: "A title, subject and note content (up to 30,000 characters) are required." });
  const data = await readData(user.id); const now = new Date().toISOString();
  if (id && safeId(id)) {
    const index = data.notes.findIndex((note) => note.id === id);
    if (index >= 0) data.notes[index] = { id, title: title.trim(), subject, content: content.trim(), updatedAt: now };
    else data.notes.unshift({ id, title: title.trim(), subject, content: content.trim(), updatedAt: now });
  } else data.notes.unshift({ id: crypto.randomUUID(), title: title.trim(), subject, content: content.trim(), updatedAt: now });
  await writeData(user.id, data); return res.json({ notes: data.notes });
});
router.delete("/notes/:id", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  const data = await readData(user.id); data.notes = data.notes.filter((note) => note.id !== req.params.id); await writeData(user.id, data); return res.json({ notes: data.notes });
});
router.get("/cards", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  const data = await readData(user.id); return res.json({ cards: data.cards });
});
router.post("/cards", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  const { front, back, subject } = req.body ?? {};
  if (typeof front !== "string" || !front.trim() || front.length > 500 || typeof back !== "string" || !back.trim() || back.length > 3000 || typeof subject !== "string" || subject.length > 100) return res.status(400).json({ message: "A front, back and subject are required." });
  const data = await readData(user.id); data.cards.unshift({ id: crypto.randomUUID(), front: front.trim(), back: back.trim(), subject, createdAt: new Date().toISOString() }); await writeData(user.id, data); return res.json({ cards: data.cards });
});
router.delete("/cards/:id", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  const data = await readData(user.id); data.cards = data.cards.filter((card) => card.id !== req.params.id); await writeData(user.id, data); return res.json({ cards: data.cards });
});

router.get("/uploads", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  try {
    const accesses = await db.orm.public.FileAccess.where({ userId: user.id }).all();
    const records = await Promise.all(accesses.map(async (access: any) => {
      const file = await db.orm.public.File.where({ id: access.fileId }).first();
      return file ? { id: file.id, originalName: file.originalName, mimeType: file.mimeType, sizeBytes: String(file.sizeBytes), status: file.status, uploadedAt: file.uploadedAt, processingError: file.processingError } : null;
    }));
    return res.json({ uploads: records.filter(Boolean) });
  } catch (error) { console.error("list uploads", error); return res.status(500).json({ message: "Could not list uploads. Check database configuration." }); }
});
router.get("/uploads/:id/text", async (req, res) => {
  const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in." });
  try {
    const access = await db.orm.public.FileAccess.where({ userId: user.id, fileId: req.params.id }).first();
    if (!access) return res.status(404).json({ message: "Uploaded file not found." });
    const record = await db.orm.public.File.where({ id: req.params.id }).first();
    if (!record) return res.status(404).json({ message: "Uploaded file not found." });
    const storageKey = String(record.storageKey || "");
    if (path.basename(storageKey) !== storageKey || storageKey.includes("..")) return res.status(400).json({ message: "Invalid file reference." });
    const text = await fs.readFile(path.join(uploadRoot, `${storageKey}.extracted.txt`), "utf8").catch(() => "");
    return res.json({ id: record.id, originalName: record.originalName, extractedText: text, hasText: Boolean(text) });
  } catch (error) { console.error("read extracted upload text", error); return res.status(500).json({ message: "Could not read extracted text. The upload storage may not be persistent." }); }
});

router.post("/upload", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in." });
  upload.single("file")(req, res, async (uploadError) => {
    if (uploadError) return res.status(uploadError instanceof multer.MulterError && uploadError.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ message: uploadError.message });
    const file = req.file; if (!file) return res.status(400).json({ message: "Choose a file to upload." });
    const ext = path.extname(file.originalname).toLowerCase();
    try {
      const buffer = await fs.readFile(file.path);
      const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
      const extracted = await extractText(file.path, ext);
      const now = new Date();
      const record = await db.orm.public.File.create({ originalName: path.basename(file.originalname).slice(0, 255), storageKey: path.basename(file.filename), mimeType: file.mimetype, extension: ext, sizeBytes: BigInt(file.size), sha256, type: ext === ".pdf" ? "PDF" : [".txt", ".md"].includes(ext) ? "TXT" : "OTHER", status: "READY", processingError: extracted.text ? null : "No selectable text was found. Image OCR or a scanned PDF may need a better scan.", uploadedAt: now, processedAt: now });
      await db.orm.public.FileAccess.create({ fileId: record.id, userId: user.id });
      await fs.writeFile(`${file.path}.extracted.txt`, extracted.text, { encoding: "utf8", mode: 0o600 });
      return res.status(201).json({ upload: { id: record.id, originalName: record.originalName, status: record.status, sizeBytes: file.size, extractedText: extracted.text, extractionMethod: extracted.method, hasText: Boolean(extracted.text), note: "Extracted text is for study support; verify it against the original lecture." } });
    } catch (error) {
      console.error("upload/process file", error);
      await fs.unlink(file.path).catch(() => undefined);
      const message = error instanceof Error ? error.message : "Upload failed.";
      return res.status(500).json({ message: message.includes("Unique constraint") ? "This exact file appears to have been uploaded before. Try renaming or re-exporting it." : "The file could not be saved or processed. Check database connection and try again." });
    }
  });
});

export default router;
