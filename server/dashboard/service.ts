import { db } from "../db";

export async function getDashboardData(userId: string) {
  const progressRecords =
    await db.orm.public.Progress
      .where({ userId })
      .all();

  const mistakes =
    await db.orm.public.Mistake
      .where({ userId })
      .all();

  const sessions =
    await db.orm.public.RecallSession
      .where({ userId })
      .all();

  const activeWeakSpots =
    await db.orm.public.WeakSpot
      .where({ userId, isResolved: false })
      .all();

  const questionRecords =
    await db.orm.public.Question.all();

  const questionById = new Map(
    questionRecords.map((question) => [question.id, question] as const)
  );

  // =========================
  // BASIC STATS
  // =========================

  const questionsRecalled =
    progressRecords.reduce(
      (total, progress) =>
        total + progress.questionsSolved,
      0
    );

  const correctAnswers =
    progressRecords.reduce(
      (total, progress) =>
        total + progress.correctAnswers,
      0
    );

  const wrongAnswers =
    progressRecords.reduce(
      (total, progress) =>
        total + progress.wrongAnswers,
      0
    );

  const recallStrength =
    questionsRecalled > 0
      ? Math.round(
          (correctAnswers / questionsRecalled) * 100
        )
      : 0;

  // =========================
  // RECENT MISTAKES
  // =========================

  const recentMistakes = mistakes
    .filter((mistake) => !mistake.resolved)
    .sort((a, b) =>
      String(b.createdAt).localeCompare(
        String(a.createdAt)
      )
    )
    .slice(0, 5)
    .map((mistake) => ({
      id: mistake.id,
      questionId: mistake.questionId,
      questionText: questionById.get(mistake.questionId)?.text ?? "Question no longer available",
      explanation: questionById.get(mistake.questionId)?.explanation ?? null,
      type: mistake.type,
      selectedAnswer: mistake.selectedAnswer,
      correctAnswer: mistake.correctAnswer,
      reviewCount: mistake.reviewCount,
      resolved: mistake.resolved,
      createdAt: mistake.createdAt,
    }));

  const allMistakes = mistakes
    .filter((mistake) => !mistake.resolved)
    .sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    )
    .map((mistake) => ({
      id: mistake.id,
      questionId: mistake.questionId,
      questionText: questionById.get(mistake.questionId)?.text ?? "Question no longer available",
      explanation: questionById.get(mistake.questionId)?.explanation ?? null,
      type: mistake.type,
      selectedAnswer: mistake.selectedAnswer,
      correctAnswer: mistake.correctAnswer,
      reviewCount: mistake.reviewCount,
      resolved: mistake.resolved,
      createdAt: mistake.createdAt,
    }));

  // =========================
  // SUBJECT PERFORMANCE
  // =========================

  const subjectMap = new Map<
    string,
    {
      subject: string;
      questionsSolved: number;
      correctAnswers: number;
      wrongAnswers: number;
    }
  >();

  for (const progress of progressRecords) {
    const existing = subjectMap.get(
      progress.subject
    );

    if (existing) {
      existing.questionsSolved +=
        progress.questionsSolved;

      existing.correctAnswers +=
        progress.correctAnswers;

      existing.wrongAnswers +=
        progress.wrongAnswers;
    } else {
      subjectMap.set(progress.subject, {
        subject: progress.subject,
        questionsSolved:
          progress.questionsSolved,
        correctAnswers:
          progress.correctAnswers,
        wrongAnswers:
          progress.wrongAnswers,
      });
    }
  }

  const subjectPerformance =
    Array.from(subjectMap.values()).map(
      (subject) => ({
        ...subject,
        accuracy:
          subject.questionsSolved > 0
            ? Math.round(
                (subject.correctAnswers /
                  subject.questionsSolved) *
                  100
              )
            : 0,
      })
    );

  // =========================
  // WEAKEST SUBJECT
  // =========================

  const weakestSubject =
    subjectPerformance.length > 0
      ? [...subjectPerformance].sort(
          (a, b) =>
            a.accuracy - b.accuracy
        )[0]
      : null;

  // =========================
  // COMPLETED SESSIONS
  // =========================

  const completedSessions =
    sessions.filter(
      (session) =>
        session.status === "COMPLETED"
    );

  return {
    stats: {
      recallStrength,
      questionsRecalled,
      correctAnswers,
      wrongAnswers,

      weakSpots: activeWeakSpots.length,

      // A real streak requires a per-day activity history;
      // Progress stores only each topic's latest activity date.
      dayStreak: 0,
    },

    mistakes: recentMistakes,

    allMistakes,

    subjects: subjectPerformance,

    weakestSubject,

    weakSpots: activeWeakSpots
      .sort((a, b) => b.priority - a.priority)
      .map((spot) => ({
        id: spot.id,
        subject: spot.subject,
        topic: spot.topic,
        accuracy: spot.accuracy,
        mistakeCount: spot.mistakeCount,
        priority: spot.priority,
        lastDetectedAt: spot.lastDetectedAt,
      })),

    sessions: {
      total: sessions.length,
      completed: completedSessions.length,
    },
  };
}