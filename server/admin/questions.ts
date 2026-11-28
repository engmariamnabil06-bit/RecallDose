import { Router, type Request } from "express";
import { db } from "../db.js";
import { getSessionUser } from "../auth/sessionUser.js";

const router = Router();

function tokenFrom(req: Request): string | null {
  const part = req.headers.cookie?.split(";").find((value) => value.trim().startsWith("session="));
  if (!part) return null;
  try { return decodeURIComponent(part.trim().slice("session=".length)); } catch { return null; }
}

async function currentAdmin(req: Request) {
  const token = tokenFrom(req);
  const user = token ? await getSessionUser(token) : null;
  return user?.role === "ADMIN" ? user : null;
}

function validateQuestion(body: any) {
  const options = Array.isArray(body?.options) ? body.options : [];
  const validDifficulty = ["EASY", "MEDIUM", "HARD"].includes(body?.difficulty);
  if (typeof body?.text !== "string" || body.text.trim().length < 10 || body.text.length > 6000 ||
      typeof body?.subject !== "string" || !body.subject.trim() || body.subject.length > 120 ||
      typeof body?.topic !== "string" || !body.topic.trim() || body.topic.length > 160 ||
      typeof body?.explanation !== "string" || body.explanation.trim().length < 10 || body.explanation.length > 6000 ||
      !validDifficulty || options.length < 2 || options.length > 6 ||
      options.some((option: any) => !option || typeof option.text !== "string" || !option.text.trim() || option.text.length > 1200) ||
      options.filter((option: any) => option.isCorrect === true).length !== 1) {
    return null;
  }
  return options;
}

router.get("/", async (req, res) => {
  const admin = await currentAdmin(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  try {
    const questions = await db.orm.public.Question.all();
    const rows = await Promise.all(questions.map(async (question: any) => ({
      ...question,
      options: await db.orm.public.QuestionOption.where({ questionId: question.id }).all(),
    })));
    rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return res.json({ questions: rows });
  } catch (error) {
    console.error("admin list questions", error);
    return res.status(500).json({ message: "Could not load the question bank." });
  }
});

router.post("/", async (req, res) => {
  const admin = await currentAdmin(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  const options = validateQuestion(req.body);
  if (!options) return res.status(400).json({ message: "Add a question, explanation, subject, topic, difficulty, and 2–6 options with exactly one correct answer." });
  const sourceTitle = typeof req.body.sourceTitle === "string" ? req.body.sourceTitle.trim().slice(0, 240) : "";
  const sourceReference = typeof req.body.sourceReference === "string" ? req.body.sourceReference.trim().slice(0, 1000) : "";
  const sourcePage = typeof req.body.sourcePage === "string" ? req.body.sourcePage.trim().slice(0, 80) : "";
  try {
    const question = await db.orm.public.Question.create({
      text: req.body.text.trim(),
      explanation: req.body.explanation.trim(),
      type: "SINGLE_CHOICE",
      difficulty: req.body.difficulty,
      subject: req.body.subject.trim(),
      topic: req.body.topic.trim(),
      sourceTitle: sourceTitle || null,
      sourceReference: sourceReference || null,
      sourcePage: sourcePage || null,
      reviewStatus: "DRAFT",
      isActive: false,
    });
    for (let index = 0; index < options.length; index += 1) {
      await db.orm.public.QuestionOption.create({
        questionId: question.id,
        text: options[index].text.trim(),
        isCorrect: options[index].isCorrect === true,
        optionOrder: index,
      });
    }
    return res.status(201).json({ question, message: "Draft created. Add a source and approve it before students can see it." });
  } catch (error) {
    console.error("admin create question", error);
    return res.status(500).json({ message: "Could not create this draft question." });
  }
});

router.post("/:id/approve", async (req, res) => {
  const admin = await currentAdmin(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  try {
    const question = await db.orm.public.Question.where({ id: req.params.id }).first();
    if (!question) return res.status(404).json({ message: "Question not found." });
    const options = await db.orm.public.QuestionOption.where({ questionId: question.id }).all();
    if (!question.sourceTitle || !question.sourceReference || !question.explanation || options.length < 2 || options.filter((item: any) => item.isCorrect).length !== 1) {
      return res.status(409).json({ message: "A source title, source reference, explanation, and exactly one correct option are required before approval." });
    }
    const updated = await db.orm.public.Question.where({ id: question.id }).update({
      reviewStatus: "APPROVED",
      reviewedAt: new Date(),
      reviewedByUserId: admin.id,
      isActive: true,
    });
    return res.json({ question: updated, message: "Question approved and published." });
  } catch (error) {
    console.error("admin approve question", error);
    return res.status(500).json({ message: "Could not approve this question." });
  }
});

router.post("/:id/archive", async (req, res) => {
  const admin = await currentAdmin(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  try {
    const question = await db.orm.public.Question.where({ id: req.params.id }).first();
    if (!question) return res.status(404).json({ message: "Question not found." });
    const updated = await db.orm.public.Question.where({ id: question.id }).update({ reviewStatus: "ARCHIVED", isActive: false });
    return res.json({ question: updated, message: "Question archived." });
  } catch (error) {
    console.error("admin archive question", error);
    return res.status(500).json({ message: "Could not archive this question." });
  }
});

export default router;
