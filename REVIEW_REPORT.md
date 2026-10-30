# Recalldose — Code Review Report

## Scope and confidence

Reviewed the source snapshot uploaded as `recalldose-review.zip`. This is a source-code review, not a production certification. I checked the app routes, API services, authentication/session handling, recall answer flow, dashboard data, and the declared roadmap.

## Fixes applied in this review copy

1. **Recall answer feedback:** the API now returns the correct option ID/text only after an answer is submitted. The UI highlights the actual correct option and shows the correct answer after a wrong response.
2. **Dashboard weak-spot count:** it now uses active saved weak spots instead of always returning `0`.
3. **Missing dashboard routes:** added protected pages for Daily Dose, Progress, Weak Spots, Mistakes, Profile, Recall Twin, and Exams. The Exams page explicitly says timed exam functionality is not wired up yet rather than pretending it works.
4. **Recall Twin API/page:** added `GET /api/recall-twin` and a page that displays rule-based summaries from recorded progress. It is clearly described as rule-based, not AI prediction.
5. **Daily Dose resume:** the session URL can carry `dailyDoseId`, and the session response marks answered questions so a reopened dose starts at the first unanswered question.
6. **Deployment configuration:** the API now respects the hosting platform's `PORT` value.
7. **Origin check:** state-changing browser requests are rejected when their `Origin` does not match `FRONTEND_ORIGIN`.
8. **Session cookie configuration:** `COOKIE_SAME_SITE` can be set to `None` for a cross-site frontend/API deployment; `None` also requires `Secure`. Keep `Lax` by default and review CSRF protection before enabling cross-site cookies.
9. **Password reset UI:** the page no longer presents a non-functional form as if it sends an email; it states that secure recovery is not connected.
10. **Test utility removed from this review copy:** `reset-test-password.ts` contained a hard-coded test email/password and is excluded from the reviewed archive. The same file should be removed from the public GitHub repository.

## Important incomplete work

- Secure password reset tokens, email delivery, expiry, and reset completion.
- Email verification and account recovery lifecycle.
- Rate limiting and stronger schema-based request validation.
- Transaction-safe account/profile creation and answer/progress updates.
- A true daily streak: the current schema stores only each topic's latest activity, not a day-by-day activity history.
- A real timed exam engine and persisted exam attempts/reports.
- Persistent Pharma Memory Lab cards/ratings and tested spaced-repetition scheduling.
- AI provider integration, source-grounded generation, cost/abuse controls, and review workflow for medical content.
- Question authoring/import and source provenance for curriculum content.
- Profile editing and account settings.
- Automated unit/integration tests and browser/accessibility testing.

## Verification performed

- TypeScript/TSX syntax transpilation: **48 files checked, zero syntax diagnostics**.
- Relative local import paths: **zero missing imports found**.
- Full TypeScript typecheck and production build: **not verified**. Dependency installation (`npm ci --ignore-scripts --no-audit --no-fund`) timed out in this environment.
- Live Neon/database and browser behavior: **not tested here**; these require the user's configured environment and credentials.

## Required GitHub security cleanup

Because the repository is public, remove the hard-coded test-password utility from the repository and commit that deletion. In the local project folder, run:

```powershell
git rm reset-test-password.ts
git add .gitignore
git commit -m "Remove hard-coded test password utility"
git push
```

If the referenced test account exists in any connected database, change its password immediately. Do not paste `.env`, `DATABASE_URL`, passwords, or API keys into chat or commit them to Git.
