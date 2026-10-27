import { db } from "../db";

type RecallTwinInput = {
  userId: string;
};

function classifyKnowledge(
  accuracy: number,
  mistakeCount: number
) {
  if (accuracy >= 85 && mistakeCount === 0) {
    return "MASTERED";
  }

  if (accuracy >= 70) {
    return "STABLE";
  }

  if (accuracy >= 40) {
    return "STRUGGLING";
  }

  return "CRITICAL";
}

export async function buildRecallTwin(
  input: RecallTwinInput
) {
  const { userId } = input;

  const progressRecords =
    await db.orm.public.Progress
      .where({
        userId,
      })
      .all();

  const weakSpots =
    await db.orm.public.WeakSpot
      .where({
        userId,
        isResolved: false,
      })
      .all();

  const mistakes =
    await db.orm.public.Mistake
      .where({
        userId,
        resolved: false,
      })
      .all();

  const totalQuestions =
    progressRecords.reduce(
      (sum, item) => sum + item.questionsSolved,
      0
    );

  const totalCorrect =
    progressRecords.reduce(
      (sum, item) => sum + item.correctAnswers,
      0
    );

  const totalWrong =
    progressRecords.reduce(
      (sum, item) => sum + item.wrongAnswers,
      0
    );

  const overallAccuracy =
    totalQuestions > 0
      ? Math.round(
          (totalCorrect / totalQuestions) * 100
        )
      : 0;

      const strongestAreas =
  progressRecords
    .filter((item) => item.questionsSolved >= 2)
    .map((item) => ({
      subject: item.subject,
      topic: item.topic,
      accuracy: item.accuracy,
      knowledgeState: classifyKnowledge(
        item.accuracy,
        item.wrongAnswers
      ),
    }))
    .filter(
      (item) =>
        item.knowledgeState === "MASTERED" ||
        item.knowledgeState === "STABLE"
    )
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);


    const weakestAreas =
  weakSpots
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .map((item) => ({
      subject: item.subject,
      topic: item.topic,
      accuracy: item.accuracy,
      mistakeCount: item.mistakeCount,
      priority: item.priority,
      knowledgeState: classifyKnowledge(
        item.accuracy,
        item.mistakeCount
      ),
    }));
  


    const knowledgeStates = {
  mastered: progressRecords.filter(
    (item) =>
      item.questionsSolved >= 2 &&
      classifyKnowledge(
        item.accuracy,
        item.wrongAnswers
      ) === "MASTERED"
  ).length,

  stable: progressRecords.filter(
    (item) =>
      item.questionsSolved >= 2 &&
      classifyKnowledge(
        item.accuracy,
        item.wrongAnswers
      ) === "STABLE"
  ).length,

  struggling: progressRecords.filter(
    (item) =>
      item.questionsSolved >= 2 &&
      classifyKnowledge(
        item.accuracy,
        item.wrongAnswers
      ) === "STRUGGLING"
  ).length,

  critical: progressRecords.filter(
    (item) =>
      item.questionsSolved >= 2 &&
      classifyKnowledge(
        item.accuracy,
        item.wrongAnswers
      ) === "CRITICAL"
  ).length,
};
  

  return {
  userId,

  overview: {
    totalQuestions,
    totalCorrect,
    totalWrong,
    overallAccuracy,
  },

  knowledgeStates,

  strongestAreas,

  weakestAreas,

  unresolvedMistakes: mistakes.length,

  weakSpotCount: weakSpots.length,
  };
}