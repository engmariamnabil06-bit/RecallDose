import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db";

const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30];

/**
 * Transparent, deterministic review schedule based on saved mistakes.
 * Uses existing Mistake fields, so no database schema migration is required.
 * reviewCount selects the next interval; createdAt is the schedule anchor.
 */
export async function buildReviewSchedule(userId: string) {
  const now = Temporal.Now.instant();
  const mistakes = await db.orm.public.Mistake
    .where({ userId, resolved: false })
    .all();

  const items = await Promise.all(mistakes.map(async (mistake) => {
    const question = await db.orm.public.Question
      .where({ id: mistake.questionId })
      .first();
    const intervalDays = REVIEW_INTERVAL_DAYS[
      Math.min(Math.max(mistake.reviewCount ?? 0, 0), REVIEW_INTERVAL_DAYS.length - 1)
    ];
    const createdAt = Temporal.Instant.from(
      new Date(mistake.updatedAt as unknown as string).toISOString()
    );
    const dueAt = createdAt.add({ days: intervalDays });
    const dueInHours = Math.ceil(
      Number(dueAt.epochMilliseconds - now.epochMilliseconds) / 3_600_000
    );
    return {
      mistakeId: mistake.id,
      questionId: mistake.questionId,
      questionText: question?.text ?? "Question no longer available",
      subject: question?.subject ?? "Uncategorized",
      topic: question?.topic ?? "General review",
      reviewCount: mistake.reviewCount ?? 0,
      intervalDays,
      dueAt: dueAt.toString(),
      dueInHours,
      status: dueInHours <= 0 ? "DUE" : "UPCOMING",
    };
  }));

  items.sort((a, b) => a.dueInHours - b.dueInHours);
  return {
    generatedAt: now.toString(),
    dueCount: items.filter((item) => item.status === "DUE").length,
    upcomingCount: items.filter((item) => item.status === "UPCOMING").length,
    items,
  };
}

/** Records that the learner has revisited this mistake and advances its interval. */
export async function recordMistakeReview(userId: string, mistakeId: string) {
  const mistake = await db.orm.public.Mistake.where({ id: mistakeId }).first();
  if (!mistake || mistake.userId !== userId) {
    throw new Error("Review item not found");
  }
  if (mistake.resolved) {
    return { id: mistake.id, resolved: true, reviewCount: mistake.reviewCount };
  }
  const now = Temporal.Now.instant();
  const updated = await db.orm.public.Mistake.where({ id: mistakeId }).update({
    reviewCount: (mistake.reviewCount ?? 0) + 1,
    updatedAt: now,
  });
  return { id: updated.id, resolved: updated.resolved, reviewCount: updated.reviewCount };
}
