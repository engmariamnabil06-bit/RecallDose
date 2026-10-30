# Study Tools implementation notes

## Added
- `/study-tools` is a protected workspace for personal notes and active-recall flashcards.
- Notes can be typed or imported from `.txt`, `.md`, and `.csv` files up to 1 MB.
- A saved note can be passed to AI Tutor as context through React Router state.
- Flashcards support create, reveal answer, previous/next navigation, and deletion.
- Dashboard navigation and quick actions now point to the workspace.

## Current limitations
- Notes and flashcards are stored in the current browser's localStorage only. They do not sync between browsers/devices or persist in the account database.
- PDF/image OCR is not implemented by this page. It deliberately rejects those files rather than pretending to extract them.
- Imported note text is sent to the AI only if the user chooses "Explain with AI". Avoid personal patient data.
- The AI route still requires a valid server-side `AI_API_KEY` and a working provider account.
