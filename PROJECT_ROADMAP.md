# Recalldose — implementation plan

## Product decisions to preserve

- Recalldose is a medical learning platform for multiple academic years, specialties, subjects, and curricula. Do not hard-code the product around one school, year, or specialty.
- Visual identity: deep navy with layered blues and cyan accents. Favicon/brand mark: an **R merged with a capsule**.
- Product style: distinctive, calm, precise, responsive, accessible, and human-designed. Prefer real iconography and restrained motion over emoji icons, repetitive gradients, or generic AI-template patterns.
- The Recall Engine should connect questions, mistakes, weak spots, spaced review, and recommendations for what to study next.
- AI must run through the server. Never expose API keys or private learning logic in frontend code. Do not promise unlimited free AI; manage cost and abuse privately and transparently.
- Medical content needs source provenance and review. AI-generated mnemonics are memory aids, not sources of truth. Do not present generated images as genuine clinical evidence.

## Agreed learning systems

### Unified Question Engine

- Single-best-answer MCQs and clinical SBAs
- Written questions: define, enumerate/list, give reasons, explain/discuss, compare/contrast, short-answer questions, essays
- Clinical cases: diagnosis, differential diagnosis, investigations, next step, management, and treatment reasoning
- Visual questions: anatomy labels, radiology, ECG, histopathology, clinical images, lab results, and graphs
- Practical/viva/OSCE-style stations
- True/false, matching, ordering, and progressive-hint questions
- Configurable by curriculum/year, specialty, subject, topic, type, difficulty, time, and marks
- Every question should support a correct answer/model answer, rationale, distractor explanations where applicable, rubric/marks, tags, and source/file/page references when available
- Written-response grading must use explicit rubrics, provide itemized feedback, identify missing or incorrect points, and describe AI scores as estimates rather than guaranteed grades

### Pharma Memory Lab

- Drug flashcards: generic name, class, mechanism, indications, adverse effects, contraindications, and interactions
- Mnemonics in Arabic or English: funny phrases, acronyms, short stories, and visual associations
- Drug-family maps and side-by-side comparisons
- Recall challenges connecting drug names, mechanisms, adverse effects, and clinical cases
- Spaced review based on recall confidence, correctness, repeated mistakes, and elapsed time
- Lecture-to-study workflow: extract proposed cards/questions with source references and allow review before publishing

### Recall Engine / Recall Twin

- Track what a learner knows, forgets, misunderstands, and repeatedly confuses
- Use response correctness, time, confidence, hint usage, and recurrence of mistakes to prioritize review
- Explain why an answer is wrong and recommend the next useful study action
- Avoid claiming validated prediction of exam performance without evidence

## Current implementation slice

- Added a custom SVG favicon with an R/capsule motif in blue tones.
- Updated the global primary palette from purple to blue shades.
- Added the protected `/pharma-memory` route and a Dashboard navigation entry.
- Added a centralized frontend API URL helper so development can use the local Express server while production can configure `VITE_API_BASE_URL` or use same-origin routes.
- Added an interactive Pharma Memory Lab preview with sample flashcards, reveal/hide answers, memory cues, category filters, navigation, and self-rating controls.
- The flashcard preview currently uses illustrative local sample data. Ratings are not persisted, and AI generation, source retrieval, database storage, and adaptive scheduling are not yet wired into this page.

## Next implementation priorities

1. Run a complete dependency install and verify frontend/server typechecks and production builds.
2. Finish authentication lifecycle (logout, password reset, rate limits, origin/CSRF protection, and transactional registration) before production use.
4. Design database-backed question and flashcard models with source/provenance, rubrics, question variants, and curriculum metadata; preserve existing data and back up before schema changes.
5. Implement the unified Question Engine and written-answer rubric flow.
6. Connect the Pharma Memory Lab to authenticated APIs, persist ratings, and add tested spaced-repetition scheduling.
7. Add secure AI provider integration, source-grounded generation, schema validation, medical-content review workflows, and cost/abuse controls.
8. Test accessibility, mobile layouts, empty/error/loading states, and deployment configuration.

## Verification note

The environment used for this update did not complete `npm ci`, so a full `npm run build` has **not** been verified. TypeScript transpilation syntax checks passed for the new page and the modified app/dashboard files; dependency-aware typechecking and browser testing remain outstanding.


## Review pass completed on the uploaded snapshot

The review copy now has real protected pages for progress, weak spots, mistakes, profile, daily dose, and the rule-based Recall Twin summary. The missing dashboard routes have been connected, answer feedback identifies the actual correct option, and daily-dose recall can reopen at the first unanswered question. The API now uses the deployment-provided port and checks Origin on state-changing requests.

Still not complete: secure password reset/email delivery, real day-streak history, exam-attempt backend, persisted Pharma Memory Lab ratings and spaced repetition, content authoring/import and source provenance, AI-provider integration, rate limiting, full CSRF review for any cross-site-cookie deployment, transaction-safe registration/answer updates, and comprehensive automated/browser tests. The build could not be verified in this environment because dependency installation timed out.
