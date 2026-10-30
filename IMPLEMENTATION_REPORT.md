# Recalldose implementation update

## Changes included
- Added authenticated `GET /api/review-schedule` endpoint.
- Added authenticated `POST /api/review-schedule/:mistakeId/reviewed` action. It verifies ownership before updating the mistake review count.
- Added a Review Schedule page at `/review-schedule`, including due/upcoming counts and a review queue.
- Added a Dashboard navigation link to Review Schedule.
- Implemented a transparent spaced-repetition rule using existing Mistake fields: 1, 3, 7, 14, and 30-day intervals. The current interval is selected by `reviewCount`; `updatedAt` is used as the review anchor.
- Improved Weak Spot priority by factoring in time since last activity, in addition to accuracy and repeated mistakes.
- Added responsive styling and reduced-motion support for the review queue.
- Kept all project files inside the top-level `RecallDose/` directory.

## Validation
- TypeScript/TSX syntax transpilation check: 130 files checked, zero syntax diagnostics.
- Full `npm run build` and server typecheck were **not run** because `node_modules` is not included in the archive and dependencies were not installed in this environment.
- Database integration and authenticated browser flows have **not** been tested against the user's Neon database.
- Review scheduling is deterministic and rule-based, not an AI prediction. It uses existing `Mistake.updatedAt` as the last-review anchor; future iterations should add a dedicated `lastReviewedAt` field and transactional updates when database migration capability is confirmed.
- Existing Exam Simulator page remains a clearly-labelled next-phase placeholder; real timed exam attempts and reports are not included in this update.
