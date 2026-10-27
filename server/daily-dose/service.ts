import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db";

type DailyDoseInput = {
  userId: string;
};

type DailyDoseActionInput = {
  userId: string;
  doseId: string;
};

type CompleteDailyDoseInput = DailyDoseActionInput & {
  completedCount: number;
};

function getScheduledDate() {
  return Temporal.Now.instant()
    .toZonedDateTimeISO("Africa/Cairo")
    .toPlainDate()
    .toString();
}

async function getDoseForUser(
  userId: string,
  doseId: string
) {
  const dose =
    await db.orm.public.DailyDose
      .where({ id: doseId })
      .first();

  if (!dose) {
    throw new Error("Daily Dose not found");
  }

  if (dose.userId !== userId) {
    throw new Error(
      "You are not allowed to access this Daily Dose"
    );
  }

  return dose;
}

/**
 * Creates or returns today's Daily Dose.
 * There can only be one Daily Dose per user per day.
 */
export async function buildDailyDose(
  input: DailyDoseInput
) {
  const { userId } = input;

  const now = Temporal.Now.instant();
  const scheduledDate = getScheduledDate();

  const existingDoses =
    await db.orm.public.DailyDose
      .where({ userId })
      .all();

  const existingDose =
    existingDoses.find(
      (dose) =>
        dose.scheduledDate === scheduledDate
    ) ?? null;

  if (existingDose) {
    return existingDose;
  }

  const weakSpots =
    await db.orm.public.WeakSpot
      .where({
        userId,
        isResolved: false,
      })
      .all();

  /*
   * No active weak spots:
   * Give the student a light dose of new questions.
   */
  if (weakSpots.length === 0) {
    return await db.orm.public.DailyDose.create({
      userId,
      type: "NEW_QUESTIONS",
      status: "PENDING",
      title: "Explore Something New",
      description:
        "Keep building your knowledge with a fresh set of questions.",
      subject: null,
      topic: null,
      targetCount: 5,
      completedCount: 0,
      scheduledDate,
      scheduledFor: now,
    });
  }

  /*
   * Highest-priority unresolved weak spot comes first.
   */
  const highestPriority =
    [...weakSpots].sort(
      (a, b) => b.priority - a.priority
    )[0];

  const isCritical =
    highestPriority.accuracy < 40;

  const doseType =
    isCritical
      ? "PRACTICE_WEAK_SPOT"
      : "REVIEW_TOPIC";

  const title =
    isCritical
      ? "Strengthen Your Weak Spot"
      : "Keep Your Knowledge Sharp";

  const description =
    isCritical
      ? `Focus on ${highestPriority.topic} to improve your recall.`
      : `Review ${highestPriority.topic} to strengthen your memory.`;

  const targetCount =
    isCritical ? 10 : 5;

  return await db.orm.public.DailyDose.create({
    userId,
    type: doseType,
    status: "PENDING",
    title,
    description,
    subject: highestPriority.subject,
    topic: highestPriority.topic,
    targetCount,
    completedCount: 0,
    scheduledDate,
    scheduledFor: now,
  });
}

/**
 * Moves a Daily Dose from PENDING to IN_PROGRESS.
 */
export async function startDailyDose(
  input: DailyDoseActionInput
) {
  const { userId, doseId } = input;

  const dose = await getDoseForUser(
    userId,
    doseId
  );

  if (dose.status === "COMPLETED") {
    throw new Error(
      "This Daily Dose is already completed"
    );
  }

  if (dose.status === "IN_PROGRESS") {
    return dose;
  }

  const now = Temporal.Now.instant();

  return await db.orm.public.DailyDose
    .where({ id: doseId })
    .update({
      status: "IN_PROGRESS",
      updatedAt: now,
    });
}

/**
 * Moves a Daily Dose to COMPLETED.
 */
export async function completeDailyDose(
  input: CompleteDailyDoseInput
) {
  const {
    userId,
    doseId,
    completedCount,
  } = input;

  const dose = await getDoseForUser(
    userId,
    doseId
  );

  if (dose.status === "COMPLETED") {
    return dose;
  }

  if (completedCount < 0) {
    throw new Error(
      "Completed count cannot be negative"
    );
  }

  if (
    dose.targetCount !== null &&
    completedCount > dose.targetCount
  ) {
    throw new Error(
      "Completed count cannot exceed the target count"
    );
  }

  const now = Temporal.Now.instant();

  return await db.orm.public.DailyDose
    .where({ id: doseId })
    .update({
      status: "COMPLETED",
      completedCount,
      completedAt: now,
      updatedAt: now,
    });
}