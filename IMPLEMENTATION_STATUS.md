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
