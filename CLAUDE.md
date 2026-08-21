# Fridger

Shared shopping list → pantry → LLM meal suggestions, for one household (2 users), installable as a PWA on Android.

Full rationale lives in `fridge-app-plan.md` and the plan at
`C:\Users\Home\.claude\plans\i-want-to-bulid-bright-parasol.md`. This file is
just the rules to enforce day to day.

## Stack

React + Vite + TypeScript + Tailwind v4. TanStack Query for server state
(polling via `refetchInterval`, not Supabase Realtime). Supabase for
Postgres + Auth + RLS. **One** Supabase Edge Function (`supabase/functions/suggest-meals`)
holds the Gemini key and does the LLM call — the only server-side code in
this project. No FastAPI, no second backend.

## The two boundaries that matter

1. **`src/domain/` imports nothing from React, Supabase, or any framework.**
   Plain TypeScript, pure functions, unit-tested with Vitest. This is where
   `normalizeName`, `purchaseItem`, `pantryHash`, etc. live.
2. **Every LLM prompt string lives in `supabase/functions/suggest-meals/prompt.ts`.**
   Nowhere else. The Gemini adapter is swappable — don't hardcode a provider
   assumption outside that function.

If you only enforce two things in review, enforce these.

## Commands

- `npm run dev` — dev server. Develop in Chrome (device emulation); only
  touch a real phone at slice boundaries.
- `npm run build` — typecheck (`tsc -b`) + bundle. Must pass before a slice
  is done.
- `npx vitest run` — domain unit tests.
- `npx supabase ...` — CLI for migrations/functions (once linked).

## Size limits

Files ≤150 lines. Functions ≤40 lines (not 20 — that drives artificial
splitting). One concern per file under `features/*`.

## Hard rules

- Never put the Gemini key, or any secret, under `src/`. It belongs in
  Supabase Function secrets only. The anon key in `.env.local` is public by
  design and is fine in `src/shared/supabase.ts`.
- Never bypass RLS from the client. The Edge Function is the only place that
  may run with elevated privilege, and it must check household membership
  itself before touching anything.
- No unit-conversion table. No ingredient taxonomy. `amount` is a single
  free-text field, nullable, no number+unit split — do not build validation
  that forces a number or a unit picker.
- Name normalization is `lowercase + trim + collapse whitespace`, nothing
  more. Do not add English singularization/stemming — it corrupts Hebrew
  input, and this app takes mixed Hebrew/English entry.
- No new dependencies without asking first.
- No reformatting or restructuring files outside the current slice's scope.
- Don't build a real rule-based recipe engine as the LLM fallback. The
  fallback is a fixed list of ~3 staples, or an honest "try again" — see the
  plan, §5.
- Language is per-household (`households.language`, 'en'|'he'), not per-user
  or browser-detected. UI copy lives in `src/shared/i18n.ts` (one flat
  dictionary) — read it with `useLanguage()` from the household feature, not
  a new i18n library. Auth/household-setup screens run before a household
  exists and stay English-only by design. In the LLM prompt, `uses` must stay
  the pantry's exact strings regardless of language — translating them would
  break `matchUsedIngredients()`'s exact-match "cooked this" deduction.

## Build order

Vertical slices (see the plan for detail): 0 skeleton → 1 shared list → 2
purchase→pantry → 3 consume → 4 LLM suggestions → 5 preferences/expiry → 6
polish. One slice per session, commit at the end of each, `/clear` between.
