
import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db";
import { updateProgress } from "../progress/service";
import { detectWeakSpots } from "../weakspots/service";

type SubmitRecallAnswerInput = {
  userId: string;
  sessionId: string;
  questionId: string;
  selectedOptionId: string;
};

export async function submitRecallAnswer(
  input: SubmitRecallAnswerInput
) {
  const { userId, sessionId, questionId, selectedOptionId } = input;

  const session = await db.orm.public.RecallSession
    .where({ id: sessionId })
    .first();

  if (!session) {
    throw new Error("Recall session not found");
  }

  if (session.userId !== userId) {
    throw new Error("You are not allowed to access this session");
  }

  const sessionQuestion =
    await db.orm.public.RecallSessionQuestion
      .where({ sessionId, questionId })
      .first();

  if (!sessionQuestion) {
    throw new Error(
      "This question does not belong to the current recall session"
    );
  }

  const question = await db.orm.public.Question
    .where({ id: questionId })
    .first();

  if (!question) {
    throw new Error("Question not found");
  }

  const selectedOption =
    await db.orm.public.QuestionOption
      .where({ id: selectedOptionId })
      .first();

  if (!selectedOption) {
    throw new Error("Selected answer was not found");
  }

  if (selectedOption.questionId !== questionId) {
    throw new Error(
      "Selected answer does not belong to this question"
    );
  }

  const correctOption =
    await db.orm.public.QuestionOption
      .where({ questionId, isCorrect: true })
      .first();

  if (!correctOption) {
    throw new Error(
      "This question has no correct answer configured"
    );
  }

  // Prevent counting a previously submitted answer twice.
  const existingAnswer = await db.orm.public.Answer
    .where({ recallSessionId: sessionId, questionId })
    .first();

  if (existingAnswer) {
    if (existingAnswer.selectedOptionId !== selectedOptionId) {
      throw new Error("This question has already been answered");
    }

    const currentSession = await db.orm.public.RecallSession
      .where({ id: sessionId })
      .first();

    if (!currentSession) {
      throw new Error("Recall session not found");
    }

    return {
      answer: {
        id: existingAnswer.id,
        isCorrect: existingAnswer.isCorrect,
        selectedOptionId: existingAnswer.selectedOptionId,
      },
      question: {
        id: question.id,
        explanation: question.explanation,
        correctOptionId: correctOption.id,
        correctAnswer: correctOption.text,
      },
      session: {
        id: currentSession.id,
        status: currentSession.status,
        totalQuestions: currentSession.totalQuestions,
        correctAnswers: currentSession.correctAnswers,
        wrongAnswers: currentSession.wrongAnswers,
        skippedAnswers: currentSession.skippedAnswers,
        completedAt: currentSession.completedAt,
      },
      alreadyAnswered: true,
    };
  }

  if (session.status !== "IN_PROGRESS") {
    throw new Error("This recall session is no longer active");
  }

  const now = Temporal.Now.instant();
  const isCorrect = selectedOption.isCorrect === true;

  const answer = await db.orm.public.Answer.create({
    recallSessionId: sessionId,
    questionId,
    selectedOptionId,
    isCorrect,
    answeredAt: now,
  });

  // Update progress and weak spots only for a newly saved answer.
  await updateProgress({
    userId,
    subject: question.subject,
    topic: question.topic,
    isCorrect,
  });

  if (!isCorrect) {
    await db.orm.public.Mistake.create({
      userId,
      questionId,
      recallSessionId: sessionId,
      type: "WRONG_ANSWER",
      selectedAnswer: selectedOption.text,
      correctAnswer: correctOption.text,
      reviewCount: 0,
      resolved: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  await detectWeakSpots({ userId });

  const newCorrectAnswers =
    session.correctAnswers + (isCorrect ? 1 : 0);

  const newWrongAnswers =
    session.wrongAnswers + (isCorrect ? 0 : 1);

  const allAnswers = await db.orm.public.Answer
    .where({ recallSessionId: sessionId })
    .all();

  const answeredCount = allAnswers.length;
  const isComplete = answeredCount >= session.totalQuestions;

  const updatedSession = await db.orm.public.RecallSession
    .where({ id: sessionId })
    .update({
      correctAnswers: newCorrectAnswers,
      wrongAnswers: newWrongAnswers,
      ...(isComplete
        ? {
            status: "COMPLETED",
            completedAt: now,
          }
        : {}),
      updatedAt: now,
    });

  // Complete the linked Daily Dose only when all session questions
  // have been answered.
  if (isComplete && session.dailyDoseId) {
    const dose = await db.orm.public.DailyDose
      .where({ id: session.dailyDoseId })
      .first();

    if (dose && dose.userId === userId && dose.status !== "COMPLETED") {
      await db.orm.public.DailyDose
        .where({ id: dose.id })
        .update({
          status: "COMPLETED",
          completedCount: answeredCount,
          completedAt: now,
          updatedAt: now,
        });
    }
  }

  return {
    answer: {
      id: answer.id,
      isCorrect,
      selectedOptionId,
    },
    question: {
      id: question.id,
      explanation: question.explanation,
      correctOptionId: correctOption.id,
      correctAnswer: correctOption.text,
    },
    session: {
      id: updatedSession.id,
      status: updatedSession.status,
      totalQuestions: updatedSession.totalQuestions,
      correctAnswers: updatedSession.correctAnswers,
      wrongAnswers: updatedSession.wrongAnswers,
      skippedAnswers: updatedSession.skippedAnswers,
      completedAt: updatedSession.completedAt,
    },
    alreadyAnswered: false,
  };
}

