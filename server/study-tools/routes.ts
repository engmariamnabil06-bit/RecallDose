import { Router, type Request } from "express";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";
import { db } from "../db.js";
import { getSessionUser } from "../auth/sessionUser.js";

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

type LegacyNote = { id: string; title: string; subject: string; content: string; updatedAt: string };
type LegacyCard = { id: string; front: string; back: string; subject: string; createdAt: string };
type LegacyStudyData = { notes?: LegacyNote[]; cards?: LegacyCard[] };

function tokenFrom(req: Request): string | null {
  const part = req.headers.cookie?.split(";").find((value) => value.trim().startsWith("session="));
  if (!part) return null;
  try { return decodeURIComponent(part.trim().slice("session=".length)); } catch { return null; }
}
async function userFor(req: Request) {
  const token = tokenFrom(req);
  return token ? getSessionUser(token) : null;
}
function safeId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
}
async function legacyDataPath(userId: string) {
  await fs.mkdir(dataRoot, { recursive: true });
  return path.join(dataRoot, `${crypto.createHash("sha256").update(userId).digest("hex")}.json`);
}

async function upsertNote(userId: string, input: { id?: unknown; title: string; subject: string; content: string }) {
  let id = safeId(input.id) ? input.id : crypto.randomUUID();
  const existing = await db.orm.public.StudyNote.where({ id, userId }).first();
  if (existing) {
    return db.orm.public.StudyNote.where({ id, userId }).update({
      title: input.title.trim(),
      subject: input.subject.trim(),
      content: input.content.trim(),
    });
  }
  const collision = await db.orm.public.StudyNote.where({ id }).first();
  if (collision) id = crypto.randomUUID();
  return db.orm.public.StudyNote.create({
    id,
    userId,
    title: input.title.trim(),
    subject: input.subject.trim(),
    content: input.content.trim(),
  });
}

async function upsertCard(userId: string, input: { id?: unknown; front: string; back: string; subject: string }) {
  let id = safeId(input.id) ? input.id : crypto.randomUUID();
  const existing = await db.orm.public.StudyCard.where({ id, userId }).first();
  if (existing) {
    return db.orm.public.StudyCard.where({ id, userId }).update({
      front: input.front.trim(),
      back: input.back.trim(),
      subject: input.subject.trim(),
    });
  }
  const collision = await db.orm.public.StudyCard.where({ id }).first();
  if (collision) id = crypto.randomUUID();
  return db.orm.public.StudyCard.create({
    id,
    userId,
    front: input.front.trim(),
    back: input.back.trim(),
    subject: input.subject.trim(),
  });
}

const migratedLegacyUsers = new Set<string>();
async function migrateLegacyStudyData(userId: string) {
  if (migratedLegacyUsers.has(userId)) return;
  const file = await legacyDataPath(userId);
  let legacy: LegacyStudyData;
  try {
    legacy = JSON.parse(await fs.readFile(file, "utf8")) as LegacyStudyData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      migratedLegacyUsers.add(userId);
      return;
    }
    throw error;
  }

  for (const note of Array.isArray(legacy.notes) ? legacy.notes : []) {
    if (note && typeof note.title === "string" && typeof note.subject === "string" && typeof note.content === "string") {
      await upsertNote(userId, note);
    }
  }
  for (const card of Array.isArray(legacy.cards) ? legacy.cards : []) {
    if (card && typeof card.front === "string" && typeof card.back === "string" && typeof card.subject === "string") {
      await upsertCard(userId, card);
    }
  }

  await fs.unlink(file).catch((error) => {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  });
  migratedLegacyUsers.add(userId);
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
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in." });
  const notes = req.body?.notes;
  if (!Array.isArray(notes) || notes.length > 500 || notes.some((note: any) =>
    !note || typeof note.title !== "string" || !note.title.trim() || note.title.length > 120 ||
    typeof note.subject !== "string" || note.subject.length > 100 ||
    typeof note.content !== "string" || !note.content.trim() || note.content.length > 30000
  )) return res.status(400).json({ message: "Invalid notes payload." });

  try {
    await migrateLegacyStudyData(user.id);
    for (const note of notes) await upsertNote(user.id, note);
    const saved = await db.orm.public.StudyNote.where({ userId: user.id }).all();
    return res.json({ notes: saved.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))) });
  } catch (error) {
    console.error("sync study notes", error);
    return res.status(500).json({ message: "Could not sync study notes." });
  }
});

router.put("/cards/sync", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in." });
  const cards = req.body?.cards;
  if (!Array.isArray(cards) || cards.length > 1000 || cards.some((card: any) =>
    !card || typeof card.front !== "string" || !card.front.trim() || card.front.length > 500 ||
    typeof card.back !== "string" || !card.back.trim() || card.back.length > 3000 ||
    typeof card.subject !== "string" || card.subject.length > 100
  )) return res.status(400).json({ message: "Invalid flashcards payload." });

  try {
    await migrateLegacyStudyData(user.id);
    for (const card of cards) await upsertCard(user.id, card);
    const saved = await db.orm.public.StudyCard.where({ userId: user.id }).all();
    return res.json({ cards: saved.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) });
  } catch (error) {
    console.error("sync study flashcards", error);
    return res.status(500).json({ message: "Could not sync flashcards." });
  }
});

router.get("/notes", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in." });
  try {
    await migrateLegacyStudyData(user.id);
    const notes = await db.orm.public.StudyNote.where({ userId: user.id }).all();
    return res.json({ notes: notes.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))) });
  } catch (error) {
    console.error("list study notes", error);
    return res.status(500).json({ message: "Could not load study notes." });
  }
});

router.post("/notes", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in." });
  const { title, subject, content, id } = req.body ?? {};
  if (typeof title !== "string" || !title.trim() || title.length > 120 ||
      typeof subject !== "string" || subject.length > 100 ||
      typeof content !== "string" || !content.trim() || content.length > 30000) {
    return res.status(400).json({ message: "A title, subject and note content (up to 30,000 characters) are required." });
  }
  try {
    await migrateLegacyStudyData(user.id);
    await upsertNote(user.id, { id, title, subject, content });
    const notes = await db.orm.public.StudyNote.where({ userId: user.id }).all();
    return res.status(201).json({ notes: notes.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))) });
  } catch (error) {
    console.error("save study note", error);
    return res.status(500).json({ message: "Could not save this note." });
  }
});

router.delete("/notes/:id", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in." });
  try {
    await migrateLegacyStudyData(user.id);
    await db.orm.public.StudyNote.where({ id: req.params.id, userId: user.id }).delete();
    const notes = await db.orm.public.StudyNote.where({ userId: user.id }).all();
    return res.json({ notes: notes.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))) });
  } catch (error) {
    console.error("delete study note", error);
    return res.status(500).json({ message: "Could not delete this note." });
  }
});

router.get("/cards", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in." });
  try {
    await migrateLegacyStudyData(user.id);
    const cards = await db.orm.public.StudyCard.where({ userId: user.id }).all();
    return res.json({ cards: cards.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) });
  } catch (error) {
    console.error("list study flashcards", error);
    return res.status(500).json({ message: "Could not load flashcards." });
  }
});

router.post("/cards", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in." });
  const { front, back, subject, id } = req.body ?? {};
  if (typeof front !== "string" || !front.trim() || front.length > 500 ||
      typeof back !== "string" || !back.trim() || back.length > 3000 ||
      typeof subject !== "string" || subject.length > 100) {
    return res.status(400).json({ message: "A front, back and subject are required." });
  }
  try {
    await migrateLegacyStudyData(user.id);
    await upsertCard(user.id, { id, front, back, subject });
    const cards = await db.orm.public.StudyCard.where({ userId: user.id }).all();
    return res.status(201).json({ cards: cards.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) });
  } catch (error) {
    console.error("save study flashcard", error);
    return res.status(500).json({ message: "Could not save this flashcard." });
  }
});

router.delete("/cards/:id", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in." });
  try {
    await migrateLegacyStudyData(user.id);
    await db.orm.public.StudyCard.where({ id: req.params.id, userId: user.id }).delete();
    const cards = await db.orm.public.StudyCard.where({ userId: user.id }).all();
    return res.json({ cards: cards.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) });
  } catch (error) {
    console.error("delete study flashcard", error);
    return res.status(500).json({ message: "Could not delete this flashcard." });
  }
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
