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
  (`normalizeName`, `purchaseItem`, `mergeAmount`, etc).
- Every LLM prompt string lives in `supabase/functions/suggest-meals/prompt.ts`,
  nowhere else — the Gemini adapter is swappable.

## Hard rules

- No secrets under `src/` — the Gemini key lives only in Supabase Function
  secrets. The Supabase anon key is public by design and is fine in
  `src/shared/supabase.ts`.
- Never bypass RLS from the client; the Edge Function is the only place
  allowed elevated privilege, and it checks household membership itself.
- `amount` is a single free-text field, no unit/number split, no
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
reads). Plus a Hebrew/English language toggle and inline amount/expiry
editing beyond the original plan. See `CLAUDE.md` for details.

Verified: auto-deploy connected via GitHub 2026-08-21.

## TODO

- Migrations `0011_shopping_item_delete_policy.sql`,
  `0012_item_categories.sql`, `0013_category_order.sql`,
  `0014_hygiene_category.sql`, and `0015_household_meal_types.sql` were
  applied by pasting their SQL directly into the Supabase dashboard's SQL
  editor (no CLI access on the device at the time), so the migration
  history table doesn't know about them. Next time someone has `supabase`
  CLI access, run `npx supabase migration repair` to mark all five as
  already applied — otherwise a future `npx supabase db push` will try to
  reapply them and fail on "already exists".
- Everything from `npm run build`/`npx vitest run` through to
  `netlify deploy` and `supabase functions/db` commands still needs to be
  run for real (typecheck, tests, lint) — recent work was done from a
  phone with no npm, so none of it has been verified to actually build.
