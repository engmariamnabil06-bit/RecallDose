import { db } from "../db.js";

export type StudyActivityInput = { userId: string; answered?: boolean; isCorrect?: boolean; sessionCompleted?: boolean };

/** Configure ACTIVITY_TIME_ZONE for the learner population; UTC is the default. */
export function getActivityDateKey(now = new Date()): string {
  const timeZone = process.env.ACTIVITY_TIME_ZONE || "UTC";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export async function recordStudyActivity(input: StudyActivityInput) {
  const activityDate = getActivityDateKey();
  const existing = await db.orm.public.StudyActivity.where({ userId: input.userId, activityDate }).first();
  const answered = input.answered === true;
  const correct = answered && input.isCorrect === true;
  const wrong = answered && input.isCorrect === false;
  const completed = input.sessionCompleted === true;
  if (!existing) return db.orm.public.StudyActivity.create({
    userId: input.userId, activityDate, questionsAnswered: answered ? 1 : 0,
    correctAnswers: correct ? 1 : 0, wrongAnswers: wrong ? 1 : 0, sessionsCompleted: completed ? 1 : 0,
  });
  return db.orm.public.StudyActivity.where({ id: existing.id }).update({
    questionsAnswered: existing.questionsAnswered + (answered ? 1 : 0),
    correctAnswers: existing.correctAnswers + (correct ? 1 : 0),
    wrongAnswers: existing.wrongAnswers + (wrong ? 1 : 0),
    sessionsCompleted: existing.sessionsCompleted + (completed ? 1 : 0),
  });
}

function shiftDate(dateKey: string, delta: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

export function calculateCurrentStreak(activityDates: string[], today = getActivityDateKey()): number {
  const recorded = new Set(activityDates);
  let cursor = recorded.has(today) ? today : shiftDate(today, -1);
  if (!recorded.has(cursor)) return 0;
  let streak = 0;
  while (recorded.has(cursor)) { streak += 1; cursor = shiftDate(cursor, -1); }
  return streak;
}