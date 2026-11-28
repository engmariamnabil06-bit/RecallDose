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

async function validateQuestionSet(rawIds: unknown, subject: string | null, topic: string | null) {
  if (!Array.isArray(rawIds) || rawIds.length < 1 || rawIds.length > 100 ||
      rawIds.some((id) => typeof id !== "string" || !id.trim()) ||
      new Set(rawIds).size !== rawIds.length) {
    throw new Error("Select between 1 and 100 different approved questions for this exam.");
  }
  const available = await db.orm.public.Question.where({ isActive: true, reviewStatus: "APPROVED" }).all();
  const byId = new Map(available.map((question: any) => [question.id, question]));
  const selected = rawIds.map((id) => byId.get(id as string)).filter(Boolean) as any[];
  if (selected.length !== rawIds.length) {
    throw new Error("One or more selected questions are missing, inactive or not approved.");
  }
  if (selected.some((question) =>
    (subject && question.subject !== subject) || (topic && question.topic !== topic)
  )) {
    throw new Error("Every selected question must match the exam's subject and topic filters.");
  }
  return selected;
}

async function setForExam(examId: string) {
  const rows = await db.orm.public.ExamQuestion.where({ examId }).all();
  return rows.sort((a: any, b: any) => a.questionOrder - b.questionOrder);
}

async function replaceExamQuestionSet(examId: string, questions: any[]) {
  await db.orm.public.ExamQuestion.where({ examId }).delete();
  try {
    for (let index = 0; index < questions.length; index += 1) {
      await db.orm.public.ExamQuestion.create({
        examId,
        questionId: questions[index].id,
        questionOrder: index,
      });
    }
  } catch (error) {
    await db.orm.public.ExamQuestion.where({ examId }).delete().catch(() => undefined);
    throw error;
  }
}

router.get("/question-bank", async (req, res) => {
  const admin = await adminFor(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  try {
    const questions = await db.orm.public.Question.where({ isActive: true, reviewStatus: "APPROVED" }).all();
    questions.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return res.json({
      questions: questions.map((question: any) => ({
        id: question.id,
        text: question.text,
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty,
        sourceTitle: question.sourceTitle,
      })),
    });
  } catch (error) {
    console.error("admin exam question bank", error);
    return res.status(500).json({ message: "Could not load approved exam questions." });
  }
});

router.get("/", async (req, res) => {
  const admin = await adminFor(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  try {
    const exams = await db.orm.public.Exam.all();
    exams.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const rows = await Promise.all(exams.map(async (exam: any) => {
      const questionSet = await setForExam(exam.id);
      return { ...exam, questionCount: questionSet.length, questionIds: questionSet.map((item: any) => item.questionId) };
    }));
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
    const selected = await validateQuestionSet(body.questionIds, subject || null, topic || null);
    const exam = await db.orm.public.Exam.create({
      title,
      description: description || null,
      subject: subject || null,
      topic: topic || null,
      durationMinutes: duration,
      status: "PUBLISHED",
    });
    try {
      await replaceExamQuestionSet(exam.id, selected);
    } catch (error) {
      await db.orm.public.Exam.where({ id: exam.id }).delete().catch(() => undefined);
      throw error;
    }
    return res.status(201).json({
      exam, questionCount: selected.length,
      message: "Exam published with its own fixed question set. Each attempt uses these same questions.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the exam.";
    if (message.startsWith("Select between") || message.startsWith("One or more selected") ||
        message.startsWith("Every selected")) {
      return res.status(400).json({ message });
    }
    console.error("admin create exam", error);
    return res.status(500).json({ message: "Could not create the exam." });
  }
});

router.put("/:id/questions", async (req, res) => {
  const admin = await adminFor(req);
  if (!admin) return res.status(403).json({ message: "Administrator access is required." });
  try {
    const exam = await db.orm.public.Exam.where({ id: req.params.id }).first();
    if (!exam) return res.status(404).json({ message: "Exam not found." });
    const selected = await validateQuestionSet(req.body?.questionIds, exam.subject, exam.topic);
    await replaceExamQuestionSet(exam.id, selected);
    return res.json({ message: "The exam now has a fixed, curated question set.", questionCount: selected.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the exam question set.";
    if (message.startsWith("Select between") || message.startsWith("One or more selected") ||
        message.startsWith("Every selected")) {
      return res.status(400).json({ message });
    }
    console.error("admin update exam question set", error);
    return res.status(500).json({ message: "Could not update the exam question set." });
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
    const questionSet = await setForExam(exam.id);
    if (questionSet.length === 0) return res.status(409).json({ message: "Select a fixed question set in Exam Builder before publishing." });
    const selected = await Promise.all(questionSet.map((item: any) =>
      db.orm.public.Question.where({ id: item.questionId, isActive: true, reviewStatus: "APPROVED" }).first()
    ));
    if (selected.some((question) => !question)) {
      return res.status(409).json({ message: "The selected set contains inactive or unapproved content. Update the set before publishing." });
    }
    const updated = await db.orm.public.Exam.where({ id: exam.id }).update({ status: "PUBLISHED" });
    return res.json({ exam: updated, questionCount: questionSet.length, message: "Exam published with its saved question set." });
  } catch (error) {
    console.error("admin publish exam", error);
    return res.status(500).json({ message: "Could not publish this exam." });
  }
});

export default router;
