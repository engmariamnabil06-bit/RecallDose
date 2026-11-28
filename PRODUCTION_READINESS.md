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
