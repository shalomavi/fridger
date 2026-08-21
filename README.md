# Fridger

Shared shopping list → pantry → LLM meal suggestions, for a 2-person household. Installable PWA, Android-first.

**Live:** https://fridger-app.netlify.app

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
- `npm run build && netlify deploy --prod --dir=dist` — deploy to production

## Status

All six planned slices are done: shared list, purchase→pantry, consume, LLM
suggestions, household preferences/expiry, and polish (merging, offline
reads). Plus a Hebrew/English language toggle and inline amount/expiry
editing beyond the original plan. See `CLAUDE.md` for details.
