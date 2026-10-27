import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db";

type UpdateProgressInput = {
  userId: string;
  subject: string | null;
  topic: string | null;
  isCorrect: boolean;
};

export async function updateProgress(
  input: UpdateProgressInput
) {
  const {
    userId,
    subject,
    topic,
    isCorrect,
  } = input;

  if (!subject) {
    return null;
  }

  const now = Temporal.Now.instant();

  const existingProgress =
    await db.orm.public.Progress
      .where({
        userId,
        subject,
        topic: topic ?? null,
      })
      .first();

  if (!existingProgress) {
    return await db.orm.public.Progress.create({
      userId,
      subject,
      topic: topic ?? null,
      questionsSeen: 1,
      questionsSolved: 1,
      correctAnswers: isCorrect ? 1 : 0,
      wrongAnswers: isCorrect ? 0 : 1,
      accuracy: isCorrect ? 100 : 0,
      studyTime: 0,
      lastActivityAt: now,
    });
  }

  const questionsSolved =
    existingProgress.questionsSolved + 1;

  const correctAnswers =
    existingProgress.correctAnswers +
    (isCorrect ? 1 : 0);

  const wrongAnswers =
    existingProgress.wrongAnswers +
    (isCorrect ? 0 : 1);

  const accuracy =
    questionsSolved > 0
      ? Math.round(
          (correctAnswers / questionsSolved) * 100
        )
      : 0;

  return await db.orm.public.Progress
    .where({
      id: existingProgress.id,
    })
    .update({
      questionsSeen:
        existingProgress.questionsSeen + 1,
      questionsSolved,
      correctAnswers,
      wrongAnswers,
      accuracy,
      lastActivityAt: now,
    });
}