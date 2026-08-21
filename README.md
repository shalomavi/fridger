# Fridger

Shared shopping list → pantry → LLM meal suggestions, for a 2-person household. Installable PWA, Android-first.

See `fridge-app-plan.md` for the architecture rationale and `CLAUDE.md` for the rules enforced during development.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npx vitest run` — domain unit tests
- `npm run lint` — oxlint

## Status

Slice 0 (walking skeleton): auth + blank authed screen + PWA install. See the build order in `CLAUDE.md`.
