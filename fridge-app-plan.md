# Shared Shopping List → Fridge → Meal Suggestions

Architecture decisions, stack choices, and a Claude Code workflow for building it.

---

## 1. What the app actually is

Three connected loops, not three features:

1. **Shopping list** — shared, multi-user, near-real-time.
2. **Fridge/pantry** — what you bought and still have. Items *move* here when checked off.
3. **Meal suggestions** — given the pantry contents, propose something to cook.

The interesting engineering is in (1) concurrency/sharing and (3) LLM cost + prompt discipline. (2) is CRUD.

**Core domain concept: the Household.** Users don't share lists with users — they join a household, and the household owns the list and the fridge. This single decision removes an entire class of permission complexity later. Do it from day one even with two users.

---

## 2. Stack recommendation

| Layer | Choice | Why |
|---|---|---|
| Mobile shell | **Capacitor + Android Studio** | You already know it. Web app → APK, sideloadable, no Play Store required. |
| Frontend | **React + Vite + TypeScript** | Your stack. Vite over Next.js — you don't need SSR inside a WebView, and static output is simpler for Capacitor. |
| State/data | **TanStack Query** + Zustand (only if needed) | Query handles server cache, retries, offline staleness. Avoid Redux here; the app is small. |
| Backend | **FastAPI (Python 3.12)** | Small files, explicit dependencies, Pydantic validation at the edge. Django is heavier than this project needs. |
| DB | **Postgres via Supabase or Neon** | Free tier, managed, no ops. |
| Auth | **Supabase Auth** (see §4) | Don't write auth. |
| LLM | **Gemini Flash free tier** (or Groq) with a provider-agnostic interface | Genuinely free at your volume; swappable. |
| Hosting | **Fly.io / Render free-ish tier** for the API | Small container, cheap or free. |

### The one real decision: Supabase-only vs Supabase + FastAPI

**Option A — Supabase only, no backend.** React talks directly to Supabase (auth, Postgres, Row Level Security, Realtime). Fastest to ship.
- ❌ Blocker: the LLM API key cannot live in a sideloaded APK. Anyone can unzip it. You'd need a Supabase Edge Function anyway — so you end up with a backend, just in TypeScript instead of Python.

**Option B — Supabase for auth/DB/realtime + FastAPI for logic. ← recommended**
- LLM key stays server-side.
- Business rules (list → fridge transition, quantity merging, expiry) live in Python where you can test them.
- You keep Realtime subscriptions for the shared list, which is the feature most sensitive to feeling "live."
- Cost: one more deploy target. Worth it.

Go with **B**.

---

## 3. Data model

```
users            (managed by Supabase Auth)
households       id, name, created_at
household_members household_id, user_id, role, joined_at
invites          code, household_id, expires_at, used_by

shopping_items   id, household_id, name, quantity, unit,
                 added_by, status(pending|purchased), purchased_at
pantry_items     id, household_id, name, quantity, unit,
                 added_at, expires_at, source_item_id
meal_suggestions id, household_id, prompt_hash, payload(jsonb),
                 created_at
```

Notes:
- `shopping_items` → `pantry_items` is a **transition, not a move**. Keep the shopping row for history; write a new pantry row. This makes "add usual items" and analytics trivial later.
- `prompt_hash` on suggestions = cache key. Same pantry contents → don't re-call the LLM. This alone probably keeps you inside free tiers.
- Enable **RLS** on every table scoped to household membership, even though FastAPI also checks. Defense in depth; costs you 10 lines each.
- Ingredient naming will be messy ("tomato" vs "Tomatoes" vs "עגבניות"). Store `name` raw + `normalized_name` (lowercased, singularized). Don't build an ingredient taxonomy yet — that's a v2 rabbit hole.

---

## 4. Auth — concretely

**Use Supabase Auth with email + password, plus Google OAuth if you want it later.**

Why not roll your own: you'd need password hashing (argon2), refresh token rotation, email verification, password reset, secure token storage on device, revocation. That's two weeks and a security surface, for a solved problem.

Why not Firebase Auth: works, but then your identity provider and your database are in different ecosystems, and you lose RLS integration.

Why not Clerk/Auth0: fine, but free tiers are more restrictive and they're heavier for a WebView app.

**How it works end to end:**
1. React uses `@supabase/supabase-js` → user signs in → receives a JWT.
2. Token stored via **Capacitor Preferences backed by Android Keystore** — *not* `localStorage`. In a WebView, localStorage is readable if the device is compromised.
3. Every FastAPI request sends `Authorization: Bearer <jwt>`.
4. FastAPI verifies the JWT signature against Supabase's JWKS endpoint (cache the keys), extracts `sub` as user_id. This is ~40 lines and one dependency (`pyjwt[crypto]`).
5. A `require_household_member` FastAPI dependency guards every household-scoped route.

**Sideload-specific gotcha:** Google OAuth needs your APK's signing certificate SHA-1 registered in Google Cloud Console. Since you're not using Play App Signing, *you* own the keystore — back it up somewhere you won't lose it, or you can never ship an update to existing installs.

---

## 5. LLM meal suggestions

Design this as a **port with two adapters** from the start:

```
MealSuggester (protocol)
├── LLMMealSuggester      → Gemini/Groq/Claude
└── RuleMealSuggester     → recipe table + ingredient matching, no network
```

Why: the LLM is the flaky, rate-limited, costly part. Having a deterministic fallback means the app still works when the free tier runs out, and it gives you something testable.

**Prompt discipline:**
- Send only pantry item names + quantities, never user identifiers.
- Demand strict JSON output (`{"meals": [{"name", "uses", "missing", "steps"}]}`), parse with Pydantic, and **fail closed** — if parsing fails, return the rule-based fallback rather than raw text.
- Rate limit per household (e.g. 20 suggestions/day) at the API layer.
- Cache on `prompt_hash`.

---

## 6. Code structure (Clean Architecture, small files)

The point of Uncle Bob's rules here isn't ceremony — it's that **the domain layer must not import FastAPI, Supabase, or the LLM SDK.** That's the one boundary that matters. If you enforce only one thing, enforce that.

```
backend/
  domain/                    # pure Python, zero I/O, zero framework imports
    household.py
    shopping_item.py
    pantry_item.py
    errors.py
  usecases/                  # one file per use case, one public function each
    add_shopping_item.py
    purchase_item.py         # the list → fridge transition
    list_pantry.py
    suggest_meals.py
    join_household.py
  ports/                     # protocols only
    repositories.py
    meal_suggester.py
  adapters/
    db/
      sqlalchemy_models.py
      household_repo.py
      pantry_repo.py
    llm/
      gemini_suggester.py
      rule_suggester.py
    auth/
      jwt_verifier.py
  api/                       # FastAPI — thin, translation only
    deps.py
    routes/
      households.py
      shopping.py
      pantry.py
      meals.py
  main.py
tests/
  domain/                    # fast, no fixtures
  usecases/                  # fakes for repos
  api/                       # httpx + test DB
```

```
frontend/src/
  features/
    auth/        { api.ts, useSession.ts, LoginForm.tsx }
    shopping/    { api.ts, useShoppingList.ts, ShoppingList.tsx, ShoppingItem.tsx }
    pantry/
    meals/
  shared/
    api/client.ts            # single place that attaches the JWT
    ui/
  app/
    routes.tsx
```

**Concrete size rules to put in CLAUDE.md:** functions ≤ 20 lines, files ≤ 150 lines, one exported use case per file, no business logic in route handlers, no `Depends()` inside `usecases/`. These are checkable, unlike "write clean code."

---

## 7. Using Claude Code effectively on this

### 7.1 Set up before writing any feature code

**`CLAUDE.md` at the repo root** — short (<150 lines), always loaded. Include:
- Stack + one-paragraph architecture summary
- The dependency rule (domain imports nothing outward) stated explicitly
- Exact commands: `uv run pytest`, `uv run ruff check`, `npm run build`, `npx cap sync android`
- File/function size limits
- "Never put secrets in frontend code" and "Never bypass `require_household_member`"
- What *not* to do: no new dependencies without asking, no reformatting unrelated files

Run `/init` to generate it, then **delete half of what it produces**. Anything Claude can discover by reading the code doesn't belong there.

**Hooks** (`.claude/settings.json`) — make correctness deterministic instead of asking nicely:
- PostToolUse on file write → `ruff format` + `ruff check --fix` for Python, `prettier` for TS
- Pre-commit → run tests

**Permissions allowlist** for `pytest`, `ruff`, `git status`, `npm run` so you're not approving prompts all day.

### 7.2 Skills — but only after you have repetition

You asked earlier whether requirements go in skills. They don't. But *these* do, once you've done each twice:

- **`new-usecase`** — scaffold a use case + its port + fake + test in the layered structure. This is the highest-value skill for this project; it's the thing you'll do 20 times.
- **`review-boundaries`** — check a diff for layering violations (framework imports in domain, logic in routes, missing auth dependency).
- **`add-migration`** — your exact Alembic workflow with the dry-run step.

Write them *after* the first vertical slice, when you know what the real pattern is. Skills written before you have working code encode guesses.

### 7.3 Build order — vertical slices, not layers

Never "build all the models, then all the endpoints." Each slice ships end to end and is independently testable:

1. **Slice 0 — walking skeleton.** Login → blank authed screen → APK installs on your phone. Boring, and it de-risks the entire Capacitor + auth + deploy chain in one day instead of in week four.
2. **Slice 1 — shopping list CRUD**, single user.
3. **Slice 2 — households + invites.** Second user sees the same list.
4. **Slice 3 — Realtime.** List updates live across devices.
5. **Slice 4 — purchase → fridge transition.**
6. **Slice 5 — rule-based meal suggestions.** No LLM yet.
7. **Slice 6 — swap in the LLM adapter.** The interface already exists, so this is a small diff.
8. **Slice 7 — expiry dates, quantity merging, polish.**

Doing 5 before 6 is deliberate: it forces the interface to be right, and it gives you a working app before you touch the least predictable dependency.

### 7.4 Per-session rhythm

- **Plan mode first** for anything non-trivial. Have Claude write the plan, read it yourself, correct it *before* code exists. Correcting a plan is cheap; correcting 400 lines isn't.
- **One slice per session.** Long sessions drift and the context fills with dead ends. `/clear` between slices.
- **Tests as the specification.** For use cases, ask for the test first, review that the test describes what you actually want, then implement.
- **Fresh-context review before merging.** Ask a subagent to review the diff against `CLAUDE.md` rules. It catches drift the writing session is blind to.
- **Commit per slice**, small and titled. Gives you a rollback point when a session goes sideways.

### 7.5 Where Claude Code will fight you on this project

- **It will over-engineer the ingredient matching.** Push back; normalized string matching is enough for v1.
- **It will drift on layering** as files accumulate — the domain will quietly acquire a `from sqlalchemy import`. The `review-boundaries` skill exists specifically for this.
- **It will scatter LLM prompt strings.** Keep every prompt in one `adapters/llm/prompts.py` and say so in CLAUDE.md.
- **It will suggest adding a state management library** you don't need. TanStack Query covers ~90% of your state.

---

## 8. Distribution

- Build: `npm run build` → `npx cap sync android` → Android Studio → signed release APK.
- **Back up the keystore and its passwords.** Losing it means existing users must uninstall to update.
- Host APKs on **GitHub Releases**; share the link.
- No Play Store means no auto-update. Add a tiny `/version` endpoint the app checks on launch, showing "update available" with the release link. ~30 lines, saves a lot of "which version are you on?"
- Users must enable "install from unknown sources" — worth writing two lines of instructions once.

---

## 9. Risks worth naming

| Risk | Mitigation |
|---|---|
| Free tiers change or throttle | Provider-agnostic LLM port; Postgres is portable |
| Supabase free project pauses on inactivity | Known behavior — a weekly cron ping, or accept cold starts |
| LLM returns garbage JSON | Pydantic parse + rule-based fallback, fail closed |
| Concurrent edits to the same list | Server is the source of truth; Realtime + optimistic UI with reconciliation |
| Scope creep into recipes/nutrition/barcodes | Every one of those is a separate project. Ship slice 7 first. |

---

## 10. If I were starting tomorrow

Day 1: repo, CLAUDE.md, hooks, Supabase project, slice 0 all the way to an APK on your phone.
Day 2–3: slices 1–2.
Then one slice per sitting. You should have something genuinely useful by slice 5, before the LLM is involved at all.

The single highest-leverage decision in this whole document is the household model in §2. The second is keeping the LLM behind a port in §5. Everything else you can refactor cheaply.
