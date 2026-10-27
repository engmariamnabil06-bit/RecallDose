# Recalldose implementation status

This document distinguishes current implementation from planned product scope.

## Implemented in this working pass

- Added `POST /api/auth/logout` to revoke the current server-side session and expire the HttpOnly session cookie.
- Added a Sign out action to the dashboard sidebar and wired it to the API.
- Removed login debug logging that printed the user object to the browser console.
- Removed a duplicated `to` prop in the Dashboard Recall Engine link.
- Kept API base URL configuration centralized in `src/lib/api.ts`.
- Kept the custom blue R + capsule SVG favicon in `public/favicon.svg` and linked it from `index.html`.

## Still incomplete / must not be represented as shipped

- Full build and typecheck: dependencies are not installed in this environment; `npm ci --ignore-scripts --no-audit --no-fund` timed out. Run the checks locally after installing dependencies.
- Forgot-password/reset flow: current page is presentation-only; token issuance, email delivery, expiry, and reset completion are not implemented.
- Register/profile writes should be reviewed for transactional guarantees and duplicate-submission behavior.
- Rate limiting, stronger request validation, production CORS/origin strategy, and security review remain required before public launch.
- Full question engine, written-answer rubrics, visual question data model, source provenance, pharma persistence, adaptive scheduling, and AI service integration remain to be implemented.
- Several dashboard navigation destinations are placeholders or do not yet have corresponding routes.
- The sample Pharma Memory Lab cards are illustrative content, not a validated medical content library.

## Verification note

No successful full build is claimed. Install dependencies, run `npm run build` and `npm run typecheck:server`, then resolve any errors before deployment.
