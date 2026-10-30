# Recalldose dashboard changes

## Included in this pass
- Fixed the landing-page feature-card icon renderer: React component icons are now rendered as `<Icon />` instead of an invalid lowercase custom element. The three cards now show Pill, BrainCircuit, and Infinity icons.
- Replaced the question-mark placeholder on the third feature card with a Lucide Infinity icon.
- Added a one-way typewriter effect to the dashboard greeting `hey future doctor`. It types slowly once and stays visible; it does not erase or restart.
- Limited the rotating motivational line list to three messages. The line types in, pauses, erases, then advances to the next message.
- Added styling for the greeting cursor and visible feature icons.

## Not claimed as completed
This pass does not finish every remaining Recalldose feature. Full curriculum content, persistent notes/flashcards in relational database tables, durable file storage, scanned-PDF OCR (including Arabic), password reset delivery, and end-to-end tests still require separate implementation and verification.

## Run
Use the normal project setup: `npm install`, configure `.env`, then run `npm run dev` and `npm run server` in separate terminals. Run `npm run build` and `npm run typecheck:server` to verify locally.
