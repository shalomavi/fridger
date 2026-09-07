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

Verified: auto-deploy connected via GitHub 2026-08-21.

## TODO

- Migrations `0011_shopping_item_delete_policy.sql` and
  `0012_item_categories.sql` were applied by pasting their SQL directly
  into the Supabase dashboard's SQL editor (no CLI access on the device
  at the time), so the migration history table doesn't know about them.
  Next time someone has `supabase` CLI access, run
  `npx supabase migration repair` to mark both as already applied —
  otherwise a future `npx supabase db push` will try to reapply them and
  fail on "already exists".
- Everything from `npm run build`/`npx vitest run` through to
  `netlify deploy` and `supabase functions/db` commands still needs to be
  run for real (typecheck, tests, lint) — recent work was done from a
  phone with no npm, so none of it has been verified to actually build.
