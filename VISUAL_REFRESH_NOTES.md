# Recalldose visual refresh notes

## Updated in this pass
- Restored the original dark charcoal + violet/cyan visual identity (`#090A0F`, `#14161D`, `#7C6CFF`, `#4CC9F0`).
- Rebuilt the landing hero into a deliberate two-column composition with a medical recall core, floating UI cards, soft orbit animation, responsive breakpoints, and reduced-motion support.
- Added a looping typewriter headline and typewriter motivational line.
- Replaced footer social controls with Email, WhatsApp, LinkedIn, and Facebook icons. LinkedIn points to the known profile; Facebook currently points to the Facebook homepage until a specific profile URL is provided.

## Required configuration before publishing
- In `src/components/Footer.tsx`, replace `YOUR_EMAIL_HERE` with the intended contact email address.
- Replace `YOUR_WHATSAPP_NUMBER` in the WhatsApp URL with the full international phone number digits (no `+`, spaces, or dashes).
- Replace `https://www.facebook.com/` with the intended Facebook profile/page URL if desired.

## Validation
- The edited JSX/TSX was reviewed for syntax and imports in source.
- A full `npm run build` and browser/responsive visual test were not run in this environment because project dependencies and a configured local database are not available here. Run `npm install` and `npm run build` locally before deployment.
