# Fridger

Shared shopping list → pantry → LLM meal suggestions, for a 2-person household. Installable PWA, Android-first.

**Live:** https://fridger-app.netlify.app

See `fridge-app-plan.md` for the architecture rationale and `CLAUDE.md` for the rules enforced during development.

## Stack

React + Vite + TypeScript + Tailwind v4. TanStack Query for server state
(polling via `refetchInterval`, not Supabase Realtime), persisted to
localStorage so the last-fetched data renders offline/on cold start — reads
only, writes still need a live connection. Supabase for Postgres + Auth +
RLS. **One** Supabase Edge Function (`supabase/functions/suggest-meals`)
holds the Gemini key and does the LLM call — the only server-side code in
this project.

## Architecture boundaries

- `src/domain/` imports nothing from React, Supabase, or any framework —
  plain TypeScript, pure functions, unit-tested with Vitest
  (`normalizeName`, `purchaseItem`, `mergeDetails`, etc).
- Every LLM prompt string lives in `supabase/functions/suggest-meals/prompt.ts`,
  nowhere else — the Gemini adapter is swappable.

## Hard rules

- No secrets under `src/` — the Gemini key lives only in Supabase Function
  secrets. The Supabase anon key is public by design and is fine in
  `src/shared/supabase.ts`.
- Never bypass RLS from the client; the Edge Function is the only place
  allowed elevated privilege, and it checks household membership itself.
- `details` is a single free-text field, no unit/number split, no
  unit-conversion table, no ingredient taxonomy.
- Name normalization is `lowercase + trim + collapse whitespace` only — no
  English stemming/singularization, since input is mixed Hebrew/English.
- Language is per-household (`households.language`), not per-user or
  browser-detected. UI copy lives in `src/shared/i18n/` (one file per
  language, combined by `index.ts`).
- Files ≤150 lines, functions ≤40 lines, one concern per file under
  `features/*`. No new dependencies without asking first.

Full detail and rationale for all of the above: `CLAUDE.md`.

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
reads). Plus a Hebrew/English language toggle and inline details/expiry
editing beyond the original plan. See `CLAUDE.md` for details.

Verified: auto-deploy connected via GitHub 2026-08-21.

Migration history table is in sync with the live database as of
2026-09-17 — all of `0001`-`0020` show as applied via `npx supabase
migration list`. `npm run build`, `npx vitest run`, and `npm run lint` all
pass.
