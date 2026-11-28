import { db } from "../db.js";

type RecallTwinInput = { userId: string };

function classifyKnowledge(accuracy: number, mistakeCount: number) {
  if (accuracy >= 85 && mistakeCount === 0) return "MASTERED";
  if (accuracy >= 70) return "STABLE";
  if (accuracy >= 40) return "STRUGGLING";
  return "CRITICAL";
}

function riskFor(progress: any, now: number) {
  const lastActivity = progress.lastActivityAt ? new Date(progress.lastActivityAt as unknown as string).getTime() : 0;
  const daysSinceActivity = lastActivity > 0 ? Math.max(0, Math.floor((now - lastActivity) / 86_400_000)) : 365;
  const accuracyRisk = (100 - Number(progress.accuracy || 0)) * 0.55;
  const repetitionRisk = Math.min(Number(progress.wrongAnswers || 0) * 7, 25);
  const forgettingRisk = Math.min(daysSinceActivity * 1.25, 20);
  const riskScore = Math.max(0, Math.min(100, Math.round(accuracyRisk + repetitionRisk + forgettingRisk)));
  const reason = Number(progress.accuracy || 0) < 50
    ? "Low recent accuracy"
    : Number(progress.wrongAnswers || 0) >= 3
      ? "Repeated mistakes"
      : daysSinceActivity >= 14
        ? "Not reviewed recently"
        : "Needs another retrieval check";
  const nextAction = Number(progress.accuracy || 0) < 60
    ? "Revisit the core explanation, then answer 3–5 focused questions."
    : Number(progress.wrongAnswers || 0) >= 3
      ? "Open the mistake bank and explain why each distractor is wrong."
      : daysSinceActivity >= 7
        ? "Schedule a short spaced-recall session today."
        : "Use one quick retrieval quiz to confirm retention.";
  return { daysSinceActivity, riskScore, reason, nextAction };
}

/**
 * A transparent learning heuristic, not a validated measure of memory or exam prediction.
 * It combines saved accuracy, repeated wrong answers and time since last activity.
 */
export async function buildRecallTwin(input: RecallTwinInput) {
  const { userId } = input;
  const [progressRecords, weakSpots, mistakes] = await Promise.all([
    db.orm.public.Progress.where({ userId }).all(),
    db.orm.public.WeakSpot.where({ userId, isResolved: false }).all(),
    db.orm.public.Mistake.where({ userId, resolved: false }).all(),
  ]);

  const now = Date.now();
  const totalQuestions = progressRecords.reduce((sum, item) => sum + item.questionsSolved, 0);
  const totalCorrect = progressRecords.reduce((sum, item) => sum + item.correctAnswers, 0);
  const totalWrong = progressRecords.reduce((sum, item) => sum + item.wrongAnswers, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const areas = progressRecords
    .filter((item) => item.questionsSolved >= 2)
    .map((item) => {
      const risk = riskFor(item, now);
      return {
        subject: item.subject,
        topic: item.topic,
        accuracy: item.accuracy,
        questionsSolved: item.questionsSolved,
        mistakeCount: item.wrongAnswers,
        knowledgeState: classifyKnowledge(item.accuracy, item.wrongAnswers),
        ...risk,
      };
    });

  const strongestAreas = areas
    .filter((item) => item.knowledgeState === "MASTERED" || item.knowledgeState === "STABLE")
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);

  const weakestAreas = weakSpots
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .map((item) => ({
      subject: item.subject,
      topic: item.topic,
      accuracy: item.accuracy,
      mistakeCount: item.mistakeCount,
      priority: item.priority,
      knowledgeState: classifyKnowledge(item.accuracy, item.mistakeCount),
    }));

  const riskAreas = areas
    .filter((item) => item.riskScore >= 35)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const nextActions = [...areas]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .map((item) => ({
      subject: item.subject,
      topic: item.topic,
      riskScore: item.riskScore,
      reason: item.reason,
      action: item.nextAction,
      daysSinceActivity: item.daysSinceActivity,
    }));

  const knowledgeStates = {
    mastered: areas.filter((item) => item.knowledgeState === "MASTERED").length,
    stable: areas.filter((item) => item.knowledgeState === "STABLE").length,
    struggling: areas.filter((item) => item.knowledgeState === "STRUGGLING").length,
    critical: areas.filter((item) => item.knowledgeState === "CRITICAL").length,
  };

  return {
    userId,
    overview: { totalQuestions, totalCorrect, totalWrong, overallAccuracy },
    knowledgeStates,
    strongestAreas,
    weakestAreas,
    riskAreas,
    nextActions,
    unresolvedMistakes: mistakes.length,
    weakSpotCount: weakSpots.length,
    generatedAt: new Date(now).toISOString(),
    methodology: "Heuristic based on saved accuracy, repeated mistakes and days since last activity. It is not a clinical tool or a validated prediction.",
  };
}
