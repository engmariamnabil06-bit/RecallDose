# Recalldose implementation status

This document distinguishes current implementation from planned product scope.

## Review pass applied to the uploaded snapshot

- Added protected routes for the dashboard destinations `/daily-dose`, `/progress`, `/weak-spots`, `/mistakes`, `/profile`, `/dr-recall`, and `/exams` so these links no longer lead to a blank route.
- Added real progress, weak-spot, unresolved-mistake, profile, daily-dose, and rule-based Recall Twin pages backed by existing authenticated APIs.
- Added `GET /api/recall-twin` and connected the dashboard's active weak-spot count to saved weak-spot records.
- Recall answer responses now include the actual correct option ID and text, so the session UI can highlight the right answer reliably and show it after a wrong response.
- Daily Dose sessions can carry a `dailyDoseId` in the session URL and move to the first unanswered question when an existing session is reopened.
- The server now honours the hosting platform's `PORT` environment variable and rejects state-changing browser requests whose Origin does not match `FRONTEND_ORIGIN`.
- Session cookie SameSite behavior can be configured with `COOKIE_SAME_SITE`; keep `Lax` unless a cross-site deployment requires `None` and its security configuration has been reviewed.
- Removed the tracked test-password reset utility from this review copy because it contained a fixed test email/password. It must also be removed from the public GitHub repository, and the test account password should be changed if that account exists.

## Implemented in this working pass

- Added a completed-session summary screen showing accuracy, correct answers, incorrect answers, skipped answers, and total questions, with direct links to mistake review and the dashboard.
- Added responsive summary styling, subtle entrance motion, and reduced-motion support.
- Confirmed the existing recall service sizes a Daily Dose session from its saved target count (capped at 10 questions) and the answer handler marks the linked dose complete only after all session questions have been answered.

- Added `POST /api/auth/logout` to revoke the current server-side session and expire the HttpOnly session cookie.
- Added a Sign out action to the dashboard sidebar and wired it to the API.
- Removed login debug logging that printed the user object to the browser console.
- Removed a duplicated `to` prop in the Dashboard Recall Engine link.
- Kept API base URL configuration centralized in `src/lib/api.ts`.
- Kept the custom blue R + capsule SVG favicon in `public/favicon.svg` and linked it from `index.html`.

## Still incomplete / must not be represented as shipped

- Full build and typecheck: dependencies are not installed in this environment; `npm ci --ignore-scripts --no-audit --no-fund` timed out. TypeScript syntax transpilation passed for the included `.ts`/`.tsx` files, but dependency-aware typechecking, production build, database tests, and browser testing are not verified. Run the checks locally after installing dependencies.
- Forgot-password/reset flow: still intentionally disabled in the UI; token issuance, secure storage, email delivery, expiry, and reset completion are not implemented.
- Register/profile writes should be reviewed for transactional guarantees and duplicate-submission behavior.
- Rate limiting, stronger request validation, production CORS/origin strategy, and security review remain required before public launch.
- Full question engine, written-answer rubrics, visual question data model, source provenance, pharma persistence, adaptive scheduling, and AI service integration remain to be implemented.
- Several dashboard navigation destinations are placeholders or do not yet have corresponding routes.
- The sample Pharma Memory Lab cards are illustrative content, not a validated medical content library.

## Verification note

No successful full build is claimed. Install dependencies, run `npm run build` and `npm run typecheck:server`, then resolve any errors before deployment.


## Learning-engine completion branch — 2026-11-28

- Added per-account daily activity records and a current streak calculation; each saved recall or exam answer contributes to the day record.
- Exam answers now update the same topic progress and weak-spot analytics as recall answers.
- Dashboard subject cards and headline counts are based on saved account data rather than fabricated demo counters.
- Recall Twin now provides transparent risk-ranked study actions based on accuracy, repeated mistakes and elapsed time. It is a heuristic, not a validated memory model or exam predictor.
- Pharma Memory Lab reads the user's persisted Study Cards and saves ratings/next-review dates through an authenticated endpoint.
- Image OCR supports English, Arabic or both; scanned-PDF OCR is still not included (PDF text extraction only).
- Added an administrator-only question authoring and review queue. Newly authored questions remain inactive drafts until a source, explanation and exactly one correct answer are checked and approved.
- Added editable learner profile fields for name, institution, faculty, academic year and specialization.

Validation still required after this branch is pushed: Prisma contract emission/migration CI, frontend production build and server typecheck. The Neon migration has not been applied. Admin account promotion remains a trusted database operation. File bytes/extracted text still use local disk; production needs configured private durable storage, backups and malware scanning. AI provider availability depends on server credentials, quotas and provider terms; source-grounded medical generation and distributed rate limiting remain future production-hardening tasks.


## Verification update — 2026-11-28

The latest GitHub Actions run for this branch completed successfully: frontend production build, server TypeScript typecheck, Prisma contract generation/planning, and source archive packaging. This supersedes the earlier note that dependency-aware build/typechecking had not yet been verified.

Still not verified by CI: applying the migration to the live Neon database, end-to-end tests against configured AI provider credentials, email delivery from the production domain, durable object storage, distributed rate limiting, and browser-based user journeys. See `PRODUCTION_READINESS.md` for the deployment and academic content checklist.

The persistent question-bank format currently supports single-choice, multiple-choice and true/false. Matching and essay prompts can be generated as AI practice, but are not yet persistently scored bank item types. No authentic Assiut University past-paper corpus is included; AI exam-coach output must be presented as simulated practice unless permitted, source-verified papers are supplied and reviewed.


## Follow-up development — exam references and memberships (2026-11-28)

- University Exam Coach now requires at least 300 characters of lecture-section or previous-exam reference material. The learner can paste the material or upload a PDF/image/TXT/MD through Upload & OCR, review extracted text, then return to the selected Exam Coach mode.
- The exam prompt first profiles observable question style and difficulty, then creates new simulated questions; it is explicitly forbidden from claiming generated items are authentic university past papers or copying supplied questions verbatim.
- Added a public Plans & Membership page linked from the landing navigation and signed-in dashboard.
- Package labels carried forward: Free Launch (first 3 months after public launch), Plus and Pro. Monthly and annual billing are planned; a 15–20% annual discount is only a target under evaluation.
- Planned Egypt payment routes remain Orange Cash and Fawry Yellow. Checkout is deliberately disabled; no money is collected and no subscription is represented as active.
- Exact prices, plan quotas, provider merchant onboarding, verified webhooks, subscription persistence/entitlement enforcement and cancellation/refund flows remain future implementation requirements. See `PRODUCTION_READINESS.md`.



## Exam Coach and membership refinement — 2026-11-28

- Exam Coach now presents three explicit difficulty choices: University, Medium and Hard.
- University mode requires a supplied reference file/text and uses it as a style template to create original, similar-format practice questions. Medium and Hard generate from the learner's requested topic without requiring a file.
- The learner is prompted to provide faculty/program, subject, topic, question count and desired question types. Exam generation receives a larger response budget than ordinary chat.
- Membership preview now proposes a 30-day all-features trial, followed by Student Plus and Pro. The trial is a planned offer, not an active entitlement; subscription checkout and backend entitlement enforcement are not yet active.
- An ongoing essential free experience is planned after the trial. Monthly/yearly prices and exact usage allowances remain unannounced until operating costs and payment fees are validated.


## Product implementation update — 2026-11-28

- **Membership:** new accounts receive a recorded 60-day full-access trial. Existing accounts receive a 60-day trial the first time they open Membership if no subscription record exists. The membership endpoint reports remaining trial days and transitions expired trial records to the essential FREE tier. Feature-by-feature entitlement enforcement is not yet implemented; all existing product routes remain governed by their current authentication/access rules.
- **Payment preparation:** intended Egypt payment methods are Fawry Plus and Orange Wallet. No wallet number, personal account identifier, merchant secret or payment credentials are stored in source control. Checkout remains disabled pending merchant onboarding, provider confirmation/webhooks, payment reconciliation, refunds and subscription entitlement enforcement.
- **Exam simulator:** timed attempts already persist answers. Finishing an exam now records skipped questions in the mistake bank and returns a per-question review with the selected answer, correct answer, explanation and available source/review provenance.
- **Exam analytics:** a student history endpoint reports completed attempts, average/best scores, and average performance grouped by subject.
- **Smart Mistake Bank / Dr. Subject:** saved wrong or skipped answers link into a dedicated subject-lecturer AI mode. It diagnoses the likely misconception, teaches the concept step by step, contrasts the wrong and correct reasoning, and asks a new retrieval question. Recent dialogue is sent with follow-up turns so the lesson can continue.
- **Medical Study Path:** the existing program/year/university selector now links each listed subject directly into a context-aware AI lesson. Catalog entries remain starter maps, not official university syllabi.
- **Verified content:** the existing admin workflow requires a source title/reference and explanation, keeps new questions in DRAFT, and records the approving admin and review timestamp before publication. The exam review screen displays source/review provenance when available.
- **Remaining production work:** apply and verify the new subscription migration on the target database; implement entitlements and paid plan checkout only after payment contracts; configure and test live AI provider credentials; add durable object storage, OCR quality checks for scanned documents, automated end-to-end exam/payment tests, and independent academic review of question banks.


## Advanced learning additions — 2026-11-28

- Added **AI Oral Exam**: a simulated examiner asks one question at a time, waits for the learner's answer, evaluates accuracy/completeness/organization/reasoning, gives concise feedback and a score, then asks one adaptive follow-up. The learner can request a final rubric and revision plan.
- Added **Lecture-Grounded Answers**: answers are restricted to the supplied lecture and cite explicit [PAGE n] or [SECTION: ...] markers. Missing source information must be acknowledged rather than guessed.
- Uploaded lecture text is labelled with page markers when PDF form-feed boundaries survive extraction, section markers when recognizable headings are present, or an explicit no-page-marker notice otherwise.
- Added an external academic-resource directory linking to question banks and biomedical references. RecallDose does not scrape or republish third-party questions.
