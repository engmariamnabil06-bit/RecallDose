# Recalldose implementation pass — 2026-10-29

## Added in this pass
- Added authenticated exam API routes under `/api/exams`: list published exams, start an attempt, save a selected answer with server-side validation, and finish/score an attempt.
- Added an interactive Exam Simulator UI in `src/pages/Insights.tsx`: available exam list, saved answer state, timer display, submit flow, score/correct/incorrect/skipped result summary, and mistake-bank link.
- Connected the new exam routes in `server/index.ts`.
- Added styling for exam answer options.

## Important implementation limitations
- An exam only appears when an `Exam` row has `status=PUBLISHED` and there are active `Question` rows matching its `subject` and optional `topic`, with configured options and a correct option.
- The current schema does not include a durable join table for an attempt's selected question set. This pass keeps that set in server memory for the lifetime of the server process. Restart-safe resume and multi-instance deployment require an `ExamAttemptQuestion` table plus a schema migration. For this reason, do not treat this as production-complete exam delivery yet.
- Timed expiry is enforced on answer submission; the UI shows the timer and asks the learner to submit when it reaches zero. A server-side auto-finalization worker is not included.
- Password reset, real file upload/OCR, database-backed curriculum/institution/version management, and scientific content review workflows are not implemented in this pass. Existing curriculum selection remains starter/sample taxonomy, not an official course catalog.
- AI Tutor needs a provider key in server-side environment variables. No live provider response was tested in this environment.

## Run and verify locally
1. Set `DATABASE_URL` in a private `.env` file.
2. Run `npm install`.
3. Run `npm run build` and `npm run typecheck:server`.
4. Run `npm run server` and `npm run dev` in separate terminals.
5. Sign in, ensure a published exam and active questions exist in the database, then test the exam flow.

Do not commit `.env` or share database/API credentials. This pass has not been build-verified because dependencies were not installed in the current environment.
