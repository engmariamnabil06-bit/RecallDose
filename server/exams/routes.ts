import { Router, type Request } from "express";
import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db.js";
import { getSessionUser } from "../auth/sessionUser.js";
import { updateProgress } from "../progress/service.js";
import { detectWeakSpots } from "../weakspots/service.js";
import { recordStudyActivity } from "../activity/service.js";
const router = Router();
// The selected question set is persisted as placeholder Answer rows (selectedOptionId=null).
// This reuses the existing relational contract and survives process restarts.
function token(req: Request) { const p=req.headers.cookie?.split(";").find(x=>x.trim().startsWith("session=")); if(!p)return null; try{return decodeURIComponent(p.trim().slice(8));}catch{return null;} }
async function userFor(req: Request) { const t=token(req); return t?getSessionUser(t):null; }
function safeQuestion(q:any, opts:any[]) { return {id:q.id,text:q.text,type:q.type,difficulty:q.difficulty,subject:q.subject,topic:q.topic,options:opts.sort((a,b)=>a.optionOrder-b.optionOrder).map(o=>({id:o.id,text:o.text}))}; }
router.get("/", async (req, res) => { const user = await userFor(req); if (!user) return res.status(401).json({ message: "Please sign in to view exams." }); try { const exams = await db.orm.public.Exam.where({ status: "PUBLISHED" }).all(); const visible = await Promise.all(exams.map(async (exam: any) => ({ id: exam.id, title: exam.title, description: exam.description, subject: exam.subject, topic: exam.topic, durationMinutes: exam.durationMinutes, questionCount: (await db.orm.public.ExamQuestion.where({ examId: exam.id }).all()).length }))); return res.json({ exams: visible }); } catch (error) { console.error("list published exams", error); return res.status(500).json({ message: "Could not load exams." }); } });
router.post("/:examId/start", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in to start an exam." });

  try {
    const exam = await db.orm.public.Exam.where({ id: req.params.examId, status: "PUBLISHED" }).first();
    if (!exam) return res.status(404).json({ message: "This exam is not available." });

    const active = await db.orm.public.ExamAttempt.where({
      examId: exam.id, userId: user.id, status: "IN_PROGRESS",
    }).first();
    if (active) return res.status(409).json({ message: "You already have an active attempt. Finish it before starting another." });

    const examQuestions = await db.orm.public.ExamQuestion.where({ examId: exam.id }).all();
    if (!examQuestions.length) {
      return res.status(409).json({ message: "This exam has no fixed question set yet. Ask an administrator to add approved questions in Exam Builder." });
    }

    const selected = await Promise.all(
      examQuestions.sort((a: any, b: any) => a.questionOrder - b.questionOrder)
        .map(async (item: any) => db.orm.public.Question.where({
          id: item.questionId, isActive: true, reviewStatus: "APPROVED",
        }).first())
    );
    if (selected.some((question) => !question)) {
      return res.status(409).json({ message: "One or more questions in this exam are no longer approved or active. An administrator must update the exam set." });
    }

    // The same curated set is used for every attempt; only its display order is shuffled.
    const questions = (selected as any[]).sort(() => Math.random() - 0.5);
    const now = Temporal.Now.instant();
    const attempt = await db.orm.public.ExamAttempt.create({
      examId: exam.id, userId: user.id, status: "IN_PROGRESS",
      totalQuestions: questions.length, correctAnswers: 0, wrongAnswers: 0,
      skippedAnswers: 0, startedAt: now,
    });

    await Promise.all(questions.map((question: any) =>
      db.orm.public.Answer.create({
        attemptId: attempt.id, questionId: question.id,
        selectedOptionId: null, isCorrect: null, answeredAt: now,
      })
    ));

    return res.status(201).json({
      attempt: {
        id: attempt.id, examId: exam.id, title: exam.title,
        durationMinutes: exam.durationMinutes, startedAt: attempt.startedAt,
        totalQuestions: questions.length, status: attempt.status,
      },
      questions: await Promise.all(questions.map(async (question: any) =>
        safeQuestion(question, await db.orm.public.QuestionOption.where({ questionId: question.id }).all())
      )),
    });
  } catch (error) {
    console.error("start fixed exam", error);
    return res.status(500).json({ message: "Could not start this exam." });
  }
});
router.get("/active", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in to resume exams." });

  try {
    const attempts = await db.orm.public.ExamAttempt
      .where({ userId: user.id, status: "IN_PROGRESS" })
      .all();

    const activeAttempts = await Promise.all(attempts.map(async (attempt: any) => {
      const exam = await db.orm.public.Exam
        .where({ id: attempt.examId })
        .first();

      if (!exam) return null;

      return {
        attemptId: attempt.id,
        examId: exam.id,
        title: exam.title,
        description: exam.description,
        subject: exam.subject,
        topic: exam.topic,
        durationMinutes: exam.durationMinutes,
        startedAt: attempt.startedAt,
        totalQuestions: attempt.totalQuestions,
      };
    }));

    return res.json({ attempts: activeAttempts.filter(Boolean) });
  } catch (error) {
    console.error("list active exam attempts", error);
    return res.status(500).json({ message: "Could not load active exam attempts." });
  }
});
router.get("/:examId/:attemptId",async(req,res)=>{const user=await userFor(req);if(!user)return res.status(401).json({message:"Please sign in to resume an exam."});try{const attempt=await db.orm.public.ExamAttempt.where({id:req.params.attemptId,examId:req.params.examId,userId:user.id}).first();if(!attempt)return res.status(404).json({message:"Exam attempt not found."});if(attempt.status!=="IN_PROGRESS")return res.status(409).json({message:"This exam attempt is already closed."});const exam=await db.orm.public.Exam.where({id:req.params.examId}).first();if(!exam)return res.status(404).json({message:"Exam not found."});const rows=await db.orm.public.Answer.where({attemptId:attempt.id}).all();const questions=await Promise.all(rows.map(async(row:any)=>{const q=await db.orm.public.Question.where({id:row.questionId,isActive:true}).first();if(!q)return null;const options=await db.orm.public.QuestionOption.where({questionId:q.id}).all();return {...safeQuestion(q,options),selectedOptionId:row.selectedOptionId||null};}));return res.json({attempt:{id:attempt.id,examId:exam.id,title:exam.title,durationMinutes:exam.durationMinutes,startedAt:attempt.startedAt,totalQuestions:attempt.totalQuestions,status:attempt.status},questions:questions.filter(Boolean)});}catch(e){console.error("resume exam",e);return res.status(500).json({message:"Could not resume this exam."});}});
router.post("/:examId/answer",async(req,res)=>{const user=await userFor(req);if(!user)return res.status(401).json({message:"Please sign in to answer."});const {attemptId,questionId,selectedOptionId}=req.body??{};if(![attemptId,questionId,selectedOptionId].every(v=>typeof v==="string"&&v.trim()))return res.status(400).json({message:"attemptId, questionId and selectedOptionId are required."});try{const attempt=await db.orm.public.ExamAttempt.where({id:attemptId,examId:req.params.examId,userId:user.id}).first();if(!attempt)return res.status(404).json({message:"Exam attempt not found."});if(attempt.status!=="IN_PROGRESS")return res.status(409).json({message:"This attempt is already closed."});const exam=await db.orm.public.Exam.where({id:req.params.examId}).first();if(!exam)return res.status(404).json({message:"Exam not found."});if(exam.durationMinutes&&Date.now()>new Date(attempt.startedAt as any).getTime()+exam.durationMinutes*60000)return res.status(409).json({message:"Time is up. Submit the exam to see your result."});const membership=await db.orm.public.Answer.where({attemptId:attempt.id,questionId}).first();if(!membership)return res.status(400).json({message:"Question is not part of this active exam session."});const q=await db.orm.public.Question.where({id:questionId,isActive:true}).first();if(!q||(exam.subject&&q.subject!==exam.subject)||(exam.topic&&q.topic!==exam.topic))return res.status(400).json({message:"Question does not match this exam."});const option=await db.orm.public.QuestionOption.where({id:selectedOptionId}).first();if(!option||option.questionId!==q.id)return res.status(400).json({message:"Selected option does not belong to this question."});const prior=await db.orm.public.Answer.where({attemptId:attempt.id,questionId:q.id}).first();if(prior?.selectedOptionId)return res.status(409).json({message:"This question has already been submitted."});const correct=await db.orm.public.QuestionOption.where({questionId:q.id,isCorrect:true}).first();if(!correct)return res.status(409).json({message:"Question has no configured correct answer."});const now=Temporal.Now.instant();if(prior) await db.orm.public.Answer.where({id:prior.id}).update({selectedOptionId:option.id,isCorrect:option.isCorrect===true,answeredAt:now}); else await db.orm.public.Answer.create({attemptId:attempt.id,questionId:q.id,selectedOptionId:option.id,isCorrect:option.isCorrect===true,answeredAt:now});if(option.isCorrect!==true)await db.orm.public.Mistake.create({userId:user.id,questionId:q.id,attemptId:attempt.id,type:"WRONG_ANSWER",selectedAnswer:option.text,correctAnswer:correct.text,reviewCount:0,resolved:false,createdAt:now,updatedAt:now});await updateProgress({userId:user.id,subject:q.subject,topic:q.topic,isCorrect:option.isCorrect===true});await detectWeakSpots({userId:user.id});return res.json({saved:true});}catch(e){console.error("save exam answer",e);return res.status(500).json({message:"Could not save this answer."});}});
router.get("/history", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in to view exam analytics." });
  try {
    const attempts = await db.orm.public.ExamAttempt.where({ userId: user.id, status: "COMPLETED" }).all();
    const history = await Promise.all(attempts.map(async (attempt: any) => {
      const exam = await db.orm.public.Exam.where({ id: attempt.examId }).first();
      return exam ? {
        attemptId: attempt.id, examId: exam.id, title: exam.title,
        subject: exam.subject, topic: exam.topic, score: attempt.score ?? 0,
        correctAnswers: attempt.correctAnswers, wrongAnswers: attempt.wrongAnswers,
        skippedAnswers: attempt.skippedAnswers, totalQuestions: attempt.totalQuestions,
        completedAt: attempt.completedAt,
      } : null;
    }));
    const completed = history.filter(Boolean).sort((a: any, b: any) =>
      new Date(b.completedAt as any).getTime() - new Date(a.completedAt as any).getTime()
    );
    const averageScore = completed.length
      ? Math.round(completed.reduce((sum: number, item: any) => sum + Number(item.score || 0), 0) / completed.length)
      : 0;
    const subjectBuckets = new Map<string, number[]>();
    for (const item of completed as any[]) {
      const subject = item.subject || "Uncategorized";
      subjectBuckets.set(subject, [...(subjectBuckets.get(subject) || []), Number(item.score || 0)]);
    }
    const bySubject = [...subjectBuckets.entries()].map(([subject, scores]) => ({
      subject, exams: scores.length,
      averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    })).sort((a, b) => a.averageScore - b.averageScore);
    return res.json({ attempts: completed.slice(0, 30), analytics: {
      totalExams: completed.length, averageScore,
      bestScore: completed.length ? Math.max(...completed.map((item: any) => Number(item.score || 0))) : 0,
      bySubject,
    }});
  } catch (error) {
    console.error("load exam history", error);
    return res.status(500).json({ message: "Could not load exam analytics." });
  }
});

router.post("/:examId/:attemptId/finish", async (req, res) => {
  const user = await userFor(req);
  if (!user) return res.status(401).json({ message: "Please sign in to finish the exam." });
  try {
    const attempt = await db.orm.public.ExamAttempt.where({
      id: req.params.attemptId, examId: req.params.examId, userId: user.id,
    }).first();
    if (!attempt) return res.status(404).json({ message: "Exam attempt not found." });
    const exam = await db.orm.public.Exam.where({ id: req.params.examId }).first();
    if (!exam) return res.status(404).json({ message: "Exam not found." });

    const allRows = await db.orm.public.Answer.where({ attemptId: attempt.id }).all();
    const total = Number(attempt.totalQuestions || allRows.length);
    const answers = allRows.filter((row: any) => Boolean(row.selectedOptionId));
    const correct = answers.filter((row: any) => row.isCorrect === true).length;
    const wrong = answers.filter((row: any) => row.isCorrect === false).length;
    const skipped = Math.max(0, total - answers.length);
    const score = total ? Math.round(correct / total * 100) : 0;
    const now = Temporal.Now.instant();

    if (attempt.status !== "COMPLETED") {
      for (const row of allRows.filter((item: any) => !item.selectedOptionId)) {
        const existing = await db.orm.public.Mistake.where({
          userId: user.id, questionId: row.questionId, attemptId: attempt.id,
        }).first();
        if (!existing) {
          const correctOption = await db.orm.public.QuestionOption.where({
            questionId: row.questionId, isCorrect: true,
          }).first();
          await db.orm.public.Mistake.create({
            userId: user.id, questionId: row.questionId, attemptId: attempt.id,
            type: "SKIPPED", selectedAnswer: null, correctAnswer: correctOption?.text ?? null,
            reviewCount: 0, resolved: false, createdAt: now, updatedAt: now,
          });
        }
      }
      await db.orm.public.ExamAttempt.where({ id: attempt.id }).update({
        status: "COMPLETED", score, totalQuestions: total,
        correctAnswers: correct, wrongAnswers: wrong, skippedAnswers: skipped, completedAt: now,
      });
      await recordStudyActivity({ userId: user.id, sessionCompleted: true });
    }

    const review = await Promise.all(allRows.map(async (row: any) => {
      const question = await db.orm.public.Question.where({ id: row.questionId }).first();
      if (!question) return null;
      const options = await db.orm.public.QuestionOption.where({ questionId: question.id }).all();
      const selectedOption = options.find((option: any) => option.id === row.selectedOptionId);
      const correctOption = options.find((option: any) => option.isCorrect === true);
      return {
        questionId: question.id, text: question.text, subject: question.subject,
        topic: question.topic, explanation: question.explanation,
        selectedAnswer: selectedOption?.text ?? null, correctAnswer: correctOption?.text ?? null,
        isCorrect: row.isCorrect === true, skipped: !row.selectedOptionId,
        sourceTitle: question.sourceTitle, sourceReference: question.sourceReference,
        reviewed: Boolean(question.reviewedAt || question.reviewedByUserId),
      };
    }));
    return res.json({ result: {
      score, correctAnswers: correct, wrongAnswers: wrong, skippedAnswers: skipped,
      totalQuestions: total, completedAt: attempt.completedAt || now, review: review.filter(Boolean),
    }});
  } catch (error) {
    console.error("finish exam", error);
    return res.status(500).json({ message: "Could not finish the exam." });
  }
});

export default router;
