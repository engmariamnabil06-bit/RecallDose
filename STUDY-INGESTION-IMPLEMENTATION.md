# Study ingestion and study-tools implementation

## Added in this pass
- Authenticated `POST /api/study-tools/upload` endpoint for PDF, PNG, JPG, WEBP, TXT and MD, max 12 MB.
- PDF text extraction using `pdf-parse`; image OCR using Tesseract.js English language data.
- Upload metadata and per-user access records use the existing `File` and `FileAccess` database models.
- Extracted text is saved beside the uploaded file and can be re-opened with `GET /api/study-tools/uploads/:id/text` after ownership checks.
- Notes and flashcards have authenticated list/sync endpoints and are synced to per-user JSON files on the server, with browser localStorage as a local cache/fallback.
- Added `/upload-ocr` page and links from Study Tools. Extracted text can be reviewed/edited and passed to AI Tutor as context.
- Added upload/storage environment variables and ignored private upload/data directories in Git.

## Important limitations before production
- This pass does not yet migrate Notes and Flashcards into first-class database tables; server-side JSON files are used for their account-scoped persistence. Use persistent private storage or migrate them to database tables before deploying to ephemeral server platforms.
- Uploaded file bytes and extracted-text sidecars are stored on local disk, while ownership metadata is in the database. Production deployment must configure a private persistent volume or object storage, backups, retention/deletion, and malware scanning.
- PDF extraction reads embedded/selectable text. Scanned PDFs with no text layer are not rendered page-by-page for OCR yet; upload page images or use a text-based PDF for this pass.
- Image OCR currently uses English (`eng`) and may misread medical terms, formulae, subscripts, Greek letters, and drug names. Always verify against the original.
- The extraction route currently stores an uploaded file's status as READY even when no text was extracted; the `processingError` field explains this condition.
- New dependencies were added to package.json. Regenerate/update package-lock by running `npm install` in the project folder; package installation and full build could not be verified in this environment.
- Do not upload patient-identifiable information. Do not expose `AI_API_KEY` in frontend code.
