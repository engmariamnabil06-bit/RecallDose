# Recalldose Project Audit — 2026-10-30

## Scope and honesty note
This audit is based on static inspection of the latest `Recalldose-dashboard-icons-typewriter.zip`. The site owner reports that the current site runs and displays well on mobile; this audit preserves the existing responsive design and does not claim independent browser/device verification. `npm install --ignore-scripts --no-audit --no-fund` timed out in the audit environment, so `npm run build`, server type-checking, and live database/API tests could not be completed here.

## Confirmed in code (static inspection)
- React Router has routes for dashboard, recall, pharma memory, AI Tutor, curriculum explorer, study tools, upload/OCR, exams, progress, weak spots, mistakes, profile, recall twin, and review schedule.
- Express mounts auth, recall, dashboard, daily-dose, recall-twin, review-schedule, AI, exams, and study-tools routers.
- AI route checks signed-in session, validates prompt length, applies an in-memory short-term rate limit, keeps provider credentials server-side, and returns an educational-use disclaimer.
- Study-tools endpoints require a signed-in user and partition JSON note/card data by a SHA-256 hash of user ID. This is server-local file storage, not a relational database model.
- Upload endpoint checks extension/MIME and size, creates file and file-access records, extracts text from text-based PDFs, and runs English OCR on image uploads.
- Exam routes include published-exam listing, start, answer save, and finish/score calculation. Selected question IDs are held in process memory, so an active attempt may not be resumable after a server restart.
- Forgot-password page remains unconnected (see `src/pages/ForgotPassword.tsx`).
- Curriculum explorer is an initial client-side map, not yet a fully populated relational curriculum catalog.

## Known gaps / risks to address
### P0 — before production
1. Run frontend build and server type-check after dependencies install; fix all errors.
2. Verify `DATABASE_URL` and Prisma 8 runtime connection on the target environment.
3. Move upload storage to persistent private storage in deployment; local disk may be ephemeral.
4. Add durable exam-attempt question membership (database relation/table) instead of process-memory `Map`.
5. Add durable note/flashcard storage in database or a clearly managed persistent store; JSON files can be lost on ephemeral hosts and concurrent writes can race.
6. Add real password-reset token flow (hashed, expiring, single-use) plus email delivery; do not show the feature as available until tested.
7. Add production-safe logging that never emits secrets or sensitive user content.

### P1 — product completeness
1. Create normalized curriculum schema and migrations for institution, country, curriculum version, program, academic year/term, course, topic, lesson, learning objective, resource, and content review.
2. Build an admin/editor workflow for adding and reviewing course content, references, licensing, and versioning.
3. Implement OCR for scanned PDFs by rendering pages to images, and add Arabic OCR support with explicit language selection; current image OCR is English only.
4. Test AI provider with a valid key and verify model/base URL, errors, timeouts, usage limits, and privacy terms.
5. Ground AI answers in approved uploaded/course sources and expose source/page references where available.
6. Seed reviewed questions and exams; validate exam duration server-side on finish, stable resume, answer persistence, and score/report correctness.
7. Connect dashboard metrics to real student data and label unavailable data instead of showing placeholder numbers.

### P2 — polish and expansion
1. Run responsive QA on common viewport sizes and keyboard/accessibility checks; user reports mobile display is currently good, so avoid unnecessary redesign.
2. Add automated tests for auth/session, ownership checks, uploads, AI status/chat, exam lifecycle, and review scheduling.
3. Add monitoring, backups, data export/deletion, privacy policy, terms, and incident recovery procedures.
4. Expand reviewed subject content gradually across programs; do not mark a curriculum complete until coverage and references are verified.

## Recommended acceptance checklist
- [ ] `npm run build` passes.
- [ ] `npm run typecheck:server` passes.
- [ ] Database connection succeeds using environment secrets, not committed files.
- [ ] Login/logout, protected routes, and expired sessions tested.
- [ ] AI chat tested with valid key and with missing/invalid key.
- [ ] Upload tested for allowed/blocked types, size limit, ownership, OCR result, and restart persistence.
- [ ] Exam tested from start through finish, with reload/restart behavior documented and verified.
- [ ] Notes/cards survive logout and server restart and remain private to the owning user.
- [ ] Mobile layouts checked at 360px, 390px, 768px and desktop width.
- [ ] No secrets, `.env`, production uploads, or user data included in release ZIP/Git.

## 2026-10-30 follow-up implementation
- Added database-backed persistence for the question membership of an active exam using the existing Answer relation (unanswered membership rows have null selectedOptionId/isCorrect).
- Added an owner-authorized resume endpoint: GET /api/exams/:examId/:attemptId.
- Answer submission updates the persisted membership row; exam scoring excludes unanswered membership rows and counts them as skipped.
- Frontend must call the resume endpoint and restore selected options/time when reopening an active attempt. This is not yet wired into the exam UI.
- Validation remains pending: dependency installation did not complete, so build/typecheck and live PostgreSQL verification were not run.
