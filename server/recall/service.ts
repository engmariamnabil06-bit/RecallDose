import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db";

const DEFAULT_QUESTION_COUNT = 5;
const MAX_QUESTION_COUNT = 10;

type CreateRecallSessionOptions = {
  dailyDoseId?: string | null;
};

async function buildSessionResponse(
  session: any,
  selectedQuestions: any[]
) {
  return {
    session: {
      id: session.id,
      status: session.status,
      totalQuestions: selectedQuestions.length,
      startedAt: session.startedAt,
      dailyDoseId: session.dailyDoseId,
    },

    questions: await Promise.all(
      selectedQuestions.map(
        async (question, index) => {
          const options =
            await db.orm.public.QuestionOption
              .where({
                questionId: question.id,
              })
              .all();

          return {
            id: question.id,
            order: index + 1,
            text: question.text,
            type: question.type,
            difficulty: question.difficulty,
            subject: question.subject,
            topic: question.topic,
            options: options
              .sort(
                (a, b) =>
                  a.optionOrder -
                  b.optionOrder
              )
              .map((option) => ({
                id: option.id,
                text: option.text,
              })),
          };
        }
      )
    ),
  };
}

export async function createRecallSession(
  userId: string,
  requestedCount = DEFAULT_QUESTION_COUNT,
  options: CreateRecallSessionOptions = {}
) {
  const now = Temporal.Now.instant();

  let dailyDose: any = null;

  // 1. Validate Daily Dose if this is a Daily Dose session.
  if (options.dailyDoseId) {
    const dose =
      await db.orm.public.DailyDose
        .where({
          id: options.dailyDoseId,
        })
        .first();

    if (!dose) {
      throw new Error("Daily Dose not found");
    }

    if (dose.userId !== userId) {
      throw new Error(
        "You are not allowed to use this Daily Dose"
      );
    }

    if (dose.status === "COMPLETED") {
      throw new Error(
        "This Daily Dose is already completed"
      );
    }

    dailyDose = dose;

    // 2. Idempotency protection:
    // If this Daily Dose already has an active Recall Session,
    // return that session instead of creating a duplicate.
    const existingSession =
      await db.orm.public.RecallSession
        .where({
          dailyDoseId: dose.id,
          status: "IN_PROGRESS",
        })
        .first();

    if (existingSession) {
      const existingSessionQuestions =
        await db.orm.public.RecallSessionQuestion
          .where({
            sessionId: existingSession.id,
          })
          .all();

      const questionIds =
        existingSessionQuestions
          .sort(
            (a, b) => a.order - b.order
          )
          .map(
            (item) => item.questionId
          );

      const existingQuestions =
        await Promise.all(
          questionIds.map(
            async (questionId) =>
              await db.orm.public.Question
                .where({
                  id: questionId,
                })
                .first()
          )
        );

      const validQuestions =
        existingQuestions.filter(
          (question) => question !== null
        );

      return buildSessionResponse(
        existingSession,
        validQuestions
      );
    }
  }

  // 3. Get the student's profile.
  const profile =
    await db.orm.public.Profile
      .where({ userId })
      .first();

  if (!profile) {
    throw new Error(
      "Student profile not found"
    );
  }

  // 4. Find the faculty connected to the profile.
  let facultyId = profile.facultyId;

  if (!facultyId && profile.faculty) {
    const faculty =
      await db.orm.public.Faculty
        .where({
          name: profile.faculty,
        })
        .first();

    facultyId = faculty?.id ?? null;
  }

  if (!facultyId) {
    throw new Error(
      "Please complete your faculty information before starting a recall session"
    );
  }

  // 5. Get active subjects for the student's faculty.
  const subjects =
    await db.orm.public.Subject
      .where({
        facultyId,
        isActive: true,
      })
      .all();

  if (subjects.length === 0) {
    throw new Error(
      "No academic subjects are available for your faculty yet"
    );
  }

  const subjectNames =
    subjects.map(
      (subject) => subject.name
    );

  // 6. Get active questions.
  const allQuestions =
    await db.orm.public.Question
      .where({
        isActive: true,
      })
      .all();

  let facultyQuestions =
    allQuestions.filter(
      (question) =>
        question.subject &&
        subjectNames.includes(
          question.subject
        )
    );

  // 7. Restrict Daily Dose sessions to
  // their assigned subject/topic.
  if (dailyDose) {
    facultyQuestions =
      facultyQuestions.filter(
        (question) => {
          const sameSubject =
            !dailyDose.subject ||
            question.subject ===
              dailyDose.subject;

          const sameTopic =
            !dailyDose.topic ||
            question.topic ===
              dailyDose.topic;

          return (
            sameSubject &&
            sameTopic
          );
        }
      );

    if (
      facultyQuestions.length === 0
    ) {
      throw new Error(
        "No recall questions are available for this Daily Dose yet"
      );
    }
  }

  if (facultyQuestions.length === 0) {
    throw new Error(
      "No recall questions are available for your faculty yet"
    );
  }

  // 8. Get unresolved mistakes.
  const previousMistakes =
    await db.orm.public.Mistake
      .where({
        userId,
      })
      .all();

  const mistakeQuestionIds =
    new Set(
      previousMistakes
        .filter(
          (mistake) =>
            !mistake.resolved
        )
        .map(
          (mistake) =>
            mistake.questionId
        )
    );

  // 9. Prioritize unresolved mistakes.
  const prioritizedQuestions =
    [...facultyQuestions].sort(
      (a, b) => {
        const aPriority =
          mistakeQuestionIds.has(
            a.id
          )
            ? 1
            : 0;

        const bPriority =
          mistakeQuestionIds.has(
            b.id
          )
            ? 1
            : 0;

        return (
          bPriority - aPriority
        );
      }
    );

  // 10. Daily Dose target controls
  // the session size.
  const doseTarget =
    dailyDose?.targetCount ?? null;

  const requestedQuestionCount =
    dailyDose
      ? doseTarget ??
        requestedCount
      : requestedCount;

  const questionCount =
    Math.min(
      Math.max(
        requestedQuestionCount,
        1
      ),
      MAX_QUESTION_COUNT
    );

  const selectedQuestions =
    prioritizedQuestions.slice(
      0,
      Math.min(
        questionCount,
        prioritizedQuestions.length
      )
    );

  if (
    selectedQuestions.length === 0
  ) {
    throw new Error(
      "No questions are available for this recall session"
    );
  }

  // 11. Create the Recall Session.
  const session =
    await db.orm.public.RecallSession.create(
      {
        userId,
        dailyDoseId:
          dailyDose?.id ?? null,
        status: "IN_PROGRESS",
        totalQuestions:
          selectedQuestions.length,
        correctAnswers: 0,
        wrongAnswers: 0,
        skippedAnswers: 0,
        startedAt: now,
        createdAt: now,
      }
    );

  // 12. Move Daily Dose to IN_PROGRESS.
  if (dailyDose) {
    await db.orm.public.DailyDose
      .where({
        id: dailyDose.id,
      })
      .update({
        status: "IN_PROGRESS",
        updatedAt: now,
      });
  }

  // 13. Attach questions.
  for (
    let index = 0;
    index <
    selectedQuestions.length;
    index++
  ) {
    await db.orm.public
      .RecallSessionQuestion.create(
        {
          sessionId:
            session.id,
          questionId:
            selectedQuestions[index].id,
          order: index + 1,
          createdAt: now,
        }
      );
  }

  // 14. Return the session.
  return buildSessionResponse(
    session,
    selectedQuestions
  );
}
