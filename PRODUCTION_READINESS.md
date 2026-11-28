# RecallDose — feature, billing and launch readiness

Reviewed: 2026-11-28  
Working branch: `feature/learning-engine-completion`

## University-level exam practice (new)

The University Exam Coach now requires at least 300 characters of reference material before a request can be sent. The learner must provide either:
- one meaningful lecture section from the target subject; or
- extracted text from a previous exam / sample paper.

The learner can paste the section directly or open Upload & OCR, upload a text-based PDF, scanned image, TXT or Markdown file, review the extraction and send it back to Exam Coach. The AI is instructed to profile the supplied source first (question wording, command verbs, terminology, depth, difficulty, option construction, topic emphasis and formats) and then generate NEW questions at a comparable level. It must not claim to know a faculty's private pattern solely from its name, copy questions verbatim, or label generated questions as authentic past papers.

Learners should include faculty/university, academic year, program, subject, chapter and requested exam format in their prompt. More than one past paper or a full lecture unit will improve the style sample. OCR output must be checked against the original, especially drug names, doses, symbols and diagrams.

## Learning experience currently implemented

- Medical learning pathways and subject starters are available through the curriculum explorer. Program names and subject lists are a broad starter taxonomy; they are not an official, exhaustive catalogue of every Egyptian university.
- The AI tutor offers specialist modes for general tutoring, mistake explanation, mnemonics, anatomy, pharmacology, histology, physiology, biochemistry, pathology, microbiology, immunology, anatomy recall, lecture simplification, quizzes, flashcards, clinical education cases, comparisons, recall planning and university exam practice.
- AI-generated exam practice is labelled as simulation. It can produce MCQ, true/false, matching, short-note, essay and application-style prompts with answer guidance/rubrics.
- The persistent question-bank schema currently supports single-choice, multiple-choice and true/false items. Matching and written/essay questions are not yet persistently scored question-bank records; they need reviewed structured answer storage, rubrics, partial-credit grading and a marking workflow.
- Admin-authored bank questions remain drafts until reviewed/approved. Source title/reference/page fields are available to preserve provenance.
- Review scheduling is a transparent deterministic interval sequence (1, 3, 7, 14, 30 days) over unresolved mistakes. Recall Twin is a heuristic prioritizer, not a clinically validated cognitive model and not an exam predictor.

## Membership packages and payment status

The public `/plans` page is now linked from the landing navigation and signed-in dashboard. It presents the agreed package structure:
- **Free Launch:** free during the first three months after public launch.
- **Plus:** expanded student study tools and AI learning support.
- **Pro:** deeper Recall Twin analytics and expanded AI learning capacity.

Monthly and annual billing choices are displayed from the start. A target annual discount of 15–20% is shown as under evaluation, not as a guaranteed offer. Exact prices, feature quotas, renewals and cancellation/refund terms remain unpublished until costs are modeled and reviewed.

**Payment is not active.** The page does not collect money or claim a subscription has been purchased. Planned Egypt payment methods are Orange Cash and Fawry Yellow, subject to provider integration and approval. Do not expose a checkout button until the provider's official API/merchant onboarding is complete.

### Required payment implementation before activation

1. Confirm provider eligibility, merchant account, API documentation, webhook signature scheme, settlement, fees, refunds and support process for Orange Cash and Fawry.
2. Model plan, subscription, invoice/payment attempt, webhook event and entitlement records in PostgreSQL. Use provider transaction IDs and idempotency keys; never trust a browser redirect as proof of payment.
3. Verify signed webhooks server-side, store raw event IDs safely, reject replay/duplicate events, and update entitlements only after a verified successful server-to-server confirmation.
4. Enforce feature access on the backend, not just by hiding frontend buttons. Define graceful free-tier behavior and clear AI/OCR usage allowances.
5. Implement monthly/yearly renewal state, failed-payment grace period, cancellation at period end, refund/chargeback handling and account billing history.
6. Publish final prices, VAT/fees if applicable, renewal/cancellation terms, refund policy and contact/support channel before checkout.
7. Test successful, pending, failed, duplicate, delayed and refunded payments in sandbox before production launch.

The page is a transparent package preview, not a payment processor or active subscription manager. No payment provider secrets or credentials are stored in this repository.

## AI provider setup and silent failover

Configure provider credentials only on the backend host. Never put API keys in frontend variables or commit them.

- Primary provider: `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`.
- Up to five fallback providers: `AI_FALLBACK_1_*` through `AI_FALLBACK_5_*`.
- Every provider must expose an OpenAI-compatible `/chat/completions` endpoint.
- Providers are attempted in configured order. A failed provider is logged server-side and the next configured provider is attempted. The learner sees neither provider names nor model names.
- `GET /api/ai/status` reports only whether AI is configured, the failover strategy, provider count and supported modes.
- Provider failover is implemented in code, but it can only be validated end-to-end after real credentials, quotas and compatible endpoints are configured on the deployed server. Keep at least one fallback key active if uninterrupted AI access matters.
- The default free model/route can be rate-limited or unavailable; a free tier is not a guaranteed SLA.

## Building a trustworthy university exam bank

Do not label generated questions as authentic Assiut University past-paper questions. To create a verified bank:

1. Obtain past-paper or faculty-approved course material that the university/faculty permits the platform to use.
2. Record faculty, program, academic year, course, topic/chapter, exam year, question format, difficulty, source title, page and permission/provenance.
3. Have a qualified subject reviewer verify the stem, every distractor, correct answer, rationale and currentness.
4. Keep imported/AI-drafted items inactive until approval.
5. Clearly distinguish verified past-paper questions, instructor-authored questions and AI-generated practice.
6. For matching and essay items, add a rubric, partial-credit policy, reviewer workflow and secure handling of written answers before enabling persistent scoring.

## Required deployment checklist

- Set a production PostgreSQL/Neon `DATABASE_URL`; check migration status before applying migrations. The fixed exam question-set migration generated by CI still needs to be checked and applied to the intended database.
- Set `FRONTEND_ORIGIN` and `PUBLIC_APP_URL` to the exact production HTTPS origin.
- Set `PASSWORD_RESET_SECRET`, a verified `RESEND_API_KEY`, and a verified `RESEND_FROM_EMAIL`; test password recovery end-to-end.
- Set AI primary/fallback credentials server-side and test each provider's compatibility, timeout and quota behavior.
- Use persistent private object storage for uploads and study files. Current local-disk storage is not durable across ephemeral deployments; add access controls, backups, retention rules and malware scanning.
- Replace process-local rate limits with a shared store such as Redis before running multiple server instances.
- Configure database backups, restore tests, monitoring, error alerts and log redaction.
- Promote administrator accounts only through a trusted database operation. Never expose admin promotion to the public registration flow.
- Run the production build, server typecheck, database migration checks, auth/reset integration tests, upload tests and browser-based end-to-end tests after deployment.
- Rotate any database credential that may previously have been committed to repository history. Removing it from the current file does not remove it from old commits.

## Verification notes

A previous CI run completed successfully for frontend production build, server TypeScript typecheck, Prisma contract generation/planning and source archive packaging. The new exam-reference flow and Plans page changes must pass a fresh CI run before packaging a new ZIP.

This is not a claim that the live database migration has been applied, live AI providers have been tested, payment processing is active, or browser end-to-end tests have passed.


## Updated exam difficulty and trial package proposal

- University Exam Coach requires a learner-provided reference (previous exam or lecture extract) and uses it to imitate observable question style and structure while generating original questions. Medium and Hard modes generate from a topic without requiring an upload.
- The interface asks learners to state faculty/program, subject, topic, question count and desired question types. Verify extraction quality before relying on a generated exam.
- Membership proposal: 30-day all-features trial, then Student Plus and Pro, with an essential free experience remaining available. This is a product proposal only; trial eligibility, entitlements, AI usage caps and billing are not yet enforced by the backend.
- Do not activate payment or advertise final prices until plan allowances, provider contracts, webhook verification, renewals, cancellation, refunds and support processes are implemented and tested.


## Product implementation update — 2026-11-28

- **Membership:** new accounts receive a recorded 60-day full-access trial. Existing accounts receive a 60-day trial the first time they open Membership if no subscription record exists. The membership endpoint reports remaining trial days and transitions expired trial records to the essential FREE tier. Feature-by-feature entitlement enforcement is not yet implemented; all existing product routes remain governed by their current authentication/access rules.
- **Payment preparation:** intended Egypt payment methods are Fawry Plus and Orange Wallet. No wallet number, personal account identifier, merchant secret or payment credentials are stored in source control. Checkout remains disabled pending merchant onboarding, provider confirmation/webhooks, payment reconciliation, refunds and subscription entitlement enforcement.
- **Exam simulator:** timed attempts already persist answers. Finishing an exam now records skipped questions in the mistake bank and returns a per-question review with the selected answer, correct answer, explanation and available source/review provenance.
- **Exam analytics:** a student history endpoint reports completed attempts, average/best scores, and average performance grouped by subject.
- **Smart Mistake Bank / Dr. Subject:** saved wrong or skipped answers link into a dedicated subject-lecturer AI mode. It diagnoses the likely misconception, teaches the concept step by step, contrasts the wrong and correct reasoning, and asks a new retrieval question. Recent dialogue is sent with follow-up turns so the lesson can continue.
- **Medical Study Path:** the existing program/year/university selector now links each listed subject directly into a context-aware AI lesson. Catalog entries remain starter maps, not official university syllabi.
- **Verified content:** the existing admin workflow requires a source title/reference and explanation, keeps new questions in DRAFT, and records the approving admin and review timestamp before publication. The exam review screen displays source/review provenance when available.
- **Remaining production work:** apply and verify the new subscription migration on the target database; implement entitlements and paid plan checkout only after payment contracts; configure and test live AI provider credentials; add durable object storage, OCR quality checks for scanned documents, automated end-to-end exam/payment tests, and independent academic review of question banks.


## Advanced tutor and external academic resources

- AI Oral Exam and Lecture-Grounded Answers use a dedicated authenticated server endpoint and server-only AI provider credentials/fallbacks. Configure AI_API_KEY or a fallback key on the API server; never expose keys in frontend variables.
- Oral exam conversation currently lives in browser state and is not yet persisted as a long-term learner record. Faculty review is recommended for examiner quality and scoring consistency.
- Page citations depend on extraction markers. Scanned image OCR may not have reliable page markers; never invent page numbers. Scanned-PDF page-by-page OCR remains future work.
- The academic directory is link-out only. EnterMedSchool.org identifies its .org materials as non-commercial with attribution required. Do not import/re-host its questions in a commercial RecallDose tier without confirming a compatible license or written permission. DrillMed is external practice only; no republication rights are assumed. NCBI Bookshelf and PMC reuse depends on each item's rights/license.
