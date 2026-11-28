import { Router, type Request } from "express";
import { db } from "../db.js";
import { getSessionUser } from "../auth/sessionUser.js";

const router = Router();

function tokenFrom(req: Request): string | null {
  const part = req.headers.cookie?.split(";").find((value) => value.trim().startsWith("session="));
  if (!part) return null;
  try { return decodeURIComponent(part.trim().slice("session=".length)); } catch { return null; }
}

async function adminFor(req: Request) {
  const token = tokenFrom(req);
  const user = token ? await getSessionUser(token) : null;
  return user?.role === "ADMIN" ? user : null;
}

async function matchingQuestionCount(subject: string | null, topic: string | null) {
  const questions = await db.orm.public.Question.where({ isActive: true }).all();
  return questions.filter((question: any) =>
    (!subject || question.subject === subject) && (!topic || question.topic === topic)
  ).length;
}

router.get("/", async (req, res) => {
  const admin = await adminFor(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  try {
    const exams = await db.orm.public.Exam.all();
    exams.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const rows = await Promise.all(exams.map(async (exam: any) => ({
      ...exam,
      matchingQuestionCount: await matchingQuestionCount(exam.subject, exam.topic),
    })));
    return res.json({ exams: rows });
  } catch (error) {
    console.error("admin list exams", error);
    return res.status(500).json({ message: "Could not load the exam list." });
  }
});

router.post("/", async (req, res) => {
  const admin = await adminFor(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  const body = req.body ?? {};
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const duration = body.durationMinutes === "" || body.durationMinutes === null || body.durationMinutes === undefined
    ? null : Number(body.durationMinutes);
  if (!title || title.length > 180 || description.length > 1200 || subject.length > 120 || topic.length > 160 ||
      (duration !== null && (!Number.isInteger(duration) || duration < 1 || duration > 240))) {
    return res.status(400).json({ message: "Enter a title, optional description and subject/topic filters; duration must be 1–240 minutes or blank." });
  }
  try {
    const count = await matchingQuestionCount(subject || null, topic || null);
    if (count === 0) return res.status(409).json({ message: "No active questions match these filters. Approve questions first or widen the subject/topic filters." });
    const exam = await db.orm.public.Exam.create({
      title,
      description: description || null,
      subject: subject || null,
      topic: topic || null,
      durationMinutes: duration,
      status: "PUBLISHED",
    });
    return res.status(201).json({ exam, matchingQuestionCount: count, message: "Exam published and available in the Exam Simulator." });
  } catch (error) {
    console.error("admin create exam", error);
    return res.status(500).json({ message: "Could not create the exam." });
  }
});

router.post("/:id/unpublish", async (req, res) => {
  const admin = await adminFor(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  try {
    const exam = await db.orm.public.Exam.where({ id: req.params.id }).first();
    if (!exam) return res.status(404).json({ message: "Exam not found." });
    const updated = await db.orm.public.Exam.where({ id: exam.id }).update({ status: "DRAFT" });
    return res.json({ exam: updated, message: "Exam unpublished. New attempts can no longer be started." });
  } catch (error) {
    console.error("admin unpublish exam", error);
    return res.status(500).json({ message: "Could not unpublish this exam." });
  }
});

router.post("/:id/publish", async (req, res) => {
  const admin = await adminFor(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  try {
    const exam = await db.orm.public.Exam.where({ id: req.params.id }).first();
    if (!exam) return res.status(404).json({ message: "Exam not found." });
    const count = await matchingQuestionCount(exam.subject, exam.topic);
    if (count === 0) return res.status(409).json({ message: "No active questions match this exam." });
    const updated = await db.orm.public.Exam.where({ id: exam.id }).update({ status: "PUBLISHED" });
    return res.json({ exam: updated, matchingQuestionCount: count, message: "Exam published." });
  } catch (error) {
    console.error("admin publish exam", error);
    return res.status(500).json({ message: "Could not publish this exam." });
  }
});

export default router;
