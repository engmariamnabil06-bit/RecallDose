# Recalldose — Free-first AI setup

The AI API now supports an ordered provider chain. The primary provider is tried first; optional fallback providers are tried when a provider fails or rate-limits. The browser never receives API keys.

## Suggested initial configuration

1. Create a Google AI Studio API key and configure the primary Gemini-compatible endpoint:

```env
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
AI_API_KEY=your_google_ai_studio_key
AI_MODEL=gemini-2.5-flash
AI_PROVIDER_LABEL=Google Gemini
```

2. Optionally configure an OpenRouter free-model fallback:

```env
AI_FALLBACK_1_LABEL=OpenRouter Free
AI_FALLBACK_1_BASE_URL=https://openrouter.ai/api/v1
AI_FALLBACK_1_API_KEY=your_openrouter_key
AI_FALLBACK_1_MODEL=openrouter/free
```

3. Optionally configure a second OpenAI-compatible fallback using `AI_FALLBACK_2_*`.

4. Restart the API server and check `GET /api/ai/status` while signed in or from the app's server health tooling. The status response lists configured provider labels and model IDs only; it never returns credentials.

## Important limits and privacy

- Free tiers are limited, can change, and are not an unlimited production guarantee. Gemini free-tier data handling and quotas differ from paid tiers. Review provider terms before sending student or institutional content.
- Never send patient-identifiable information or real patient records to a general-purpose model. Recalldose is an educational product, not a clinical decision system.
- Keep all provider keys in server environment variables. Never use `VITE_` prefixes for secrets.
- Fallback only works if a second provider is configured and reachable. It does not bypass a user's own app-level request throttle.
- Provider failover does not verify medical accuracy. Course sources, citations, expert review, and content provenance remain required product work.

## Current implementation boundary

The current AI route supports the tutor, mistake-explanation, and mnemonic modes with an OpenAI-compatible chat-completions interface. This change adds provider failover and a provider status summary; it does not yet implement retrieval-augmented generation, source citation validation, AI question publishing, OCR translation, or a paid-provider billing switchboard.
