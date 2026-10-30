# Exam persistence update

## What changed
- The exam question set is now persisted in the existing `Answer` relation at exam start as rows with `selectedOptionId = null` and `isCorrect = null`.
- Submitting an answer updates its existing row instead of creating a second row.
- `GET /api/exams/:examId/:attemptId` restores an in-progress attempt and its question order after a browser refresh or server restart.
- Finishing an exam counts only rows with a selected option; unsubmitted placeholders are counted as skipped.
- The implementation reuses the current Prisma contract and does not require a schema migration.

## API resume response
`GET /api/exams/:examId/:attemptId` requires the signed-in owner of the attempt and returns the attempt metadata plus the persisted question list and `selectedOptionId` for each answered question.

## Frontend integration still required
The exam page should call this endpoint when it has an active attempt ID (for example, from its route or session state), restore the returned questions and selected options, and calculate remaining time from `startedAt` and `durationMinutes`. The server remains authoritative for the deadline.

## Validation status
Static source review only. Dependency installation and build/typecheck were not completed in the current environment, and no live database test was run. Verify the existing Prisma runtime's nullable field handling against the connected PostgreSQL database before production deployment.
