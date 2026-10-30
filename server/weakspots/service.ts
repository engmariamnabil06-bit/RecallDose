import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db";

type WeakSpotInput = {
  userId: string;
};

function calculatePriority(
  accuracy: number,
  mistakeCount: number,
  daysSinceActivity: number
): number {
  let priority = 0;

  if (accuracy < 50) {
    priority += 50;
  } else if (accuracy < 70) {
    priority += 35;
  } else if (accuracy < 85) {
    priority += 20;
  }

  // Repeated mistakes matter, but stale weak areas also need attention.
  priority += Math.min(mistakeCount * 5, 50);

  if (daysSinceActivity >= 30) {
    priority += 15;
  } else if (daysSinceActivity >= 14) {
    priority += 10;
  } else if (daysSinceActivity >= 7) {
    priority += 5;
  }

  return Math.min(priority, 100);
}

export async function detectWeakSpots(
  input: WeakSpotInput
) {
  const { userId } = input;

  const now = Temporal.Now.instant();

  const progressRecords =
    await db.orm.public.Progress
      .where({
        userId,
      })
      .all();

  const weakSpots = [];

  for (const progress of progressRecords) {
    if (!progress.topic) {
      continue;
    }

    if (progress.questionsSolved < 2) {
      continue;
    }

    const mistakeCount = progress.wrongAnswers;
    const lastActivity = progress.lastActivityAt
      ? new Date(progress.lastActivityAt as unknown as string).getTime()
      : now.epochMilliseconds;
    const daysSinceActivity = Math.max(
      0,
      Math.floor((now.epochMilliseconds - lastActivity) / 86_400_000)
    );

    const priority = calculatePriority(
      progress.accuracy,
      mistakeCount,
      daysSinceActivity
    );

    const isWeak =
      progress.accuracy < 70 ||
      mistakeCount >= 2;

    const existingWeakSpot =
      await db.orm.public.WeakSpot
        .where({
          userId,
          subject: progress.subject,
          topic: progress.topic,
        })
        .first();

    if (!isWeak) {
      if (existingWeakSpot) {
        await db.orm.public.WeakSpot
          .where({
            id: existingWeakSpot.id,
          })
          .update({
            accuracy: progress.accuracy,
            mistakeCount,
            priority: 0,
            isResolved: true,
            resolvedAt: now,
          });
      }

      continue;
    }

    if (!existingWeakSpot) {
      const weakSpot =
        await db.orm.public.WeakSpot.create({
          userId,
          subject: progress.subject,
          topic: progress.topic,
          accuracy: progress.accuracy,
          mistakeCount,
          priority,
          isResolved: false,
          lastDetectedAt: now,
        });

      weakSpots.push(weakSpot);
      continue;
    }

    const weakSpot =
      await db.orm.public.WeakSpot
        .where({
          id: existingWeakSpot.id,
        })
        .update({
          accuracy: progress.accuracy,
          mistakeCount,
          priority,
          isResolved: false,
          lastDetectedAt: now,
          resolvedAt: null,
        });

    weakSpots.push(weakSpot);
  }

  return weakSpots;
}