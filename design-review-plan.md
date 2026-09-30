# Design Review — Findings & Remediation Plan

Review date: 2026-09-30. Scope: the whole repo (`src/`, `supabase/migrations/`,
`supabase/functions/`, docs, CI), plus the live `pg_policies` of project
`mnwcypcbnvuopakkbbht` for the household/invite tables.

The review checked eight areas. This file gives the findings for each area
first, then a step-by-step plan that fixes all of them, ordered by risk. Each
step lists the files it touches, what to change, and how to check it worked.

---

## Part 1 — Findings

### Scorecard

| Area | Verdict |
|---|---|
| Requirements & constraints | ✅ Strong — clear scope (1 household, 2 users), hard rules in `CLAUDE.md` |
| Data modeling & indexing | 🟡 Model is sound; some indexes missing, tables with no retention, enum lists duplicated |
| Scalability & performance | ✅ Right-sized (polling, pantry cap, daily LLM limits) |
| Reliability & failure handling | 🟡 Multi-write flows can half-finish; a failed LLM call gets cached as a real result; no LLM timeouts |
| Security | 🔴 Critical: any signed-in user can join any household. Plus SSRF gaps and OAuth race conditions |
| Observability | 🔴 Only `console.error` in edge functions; no client error tracking and no metrics |
| Trade-off documentation | 🟡 Lots of rationale, but no ADRs; README contradicts CLAUDE.md |
| Simplification | ✅ Good boundaries; purchase logic duplicated between client and MCP |

### S1 — 🔴 CRITICAL: any signed-in user can join any household (confirmed on the live DB)

- `invites` SELECT policy is `auth.uid() IS NOT NULL` (`0002`), so any
  signed-in user can list **every** invite, including each one's `household_id`.
- `household_members` INSERT policy is `user_id = auth.uid()` (`0001`). It
  never checks for a valid invite, so a user can add themselves to **any**
  household id.
- Signup is open, and email confirmation is off in `supabase/config.toml`
  (still to check on the hosted project).
- **Exploit chain:** sign up → `select * from invites` → `insert into
  household_members (household_id, user_id) values (<any>, <me>)` → full
  read/write access to that household's shopping list, pantry, recipes and
  preferences, plus the ability to create MCP tokens for it.
- The join itself runs as three separate client-side writes
  (`src/features/household/invites.ts`), and the database is what should be
  enforcing it.

### S2 — Invite claim race and weak randomness
- When a code was already used, the claim `update` matches zero rows because
  of RLS. **That is not an error**, so the `claimError` branch in
  `invites.ts` never fires, and two users can redeem the same code.
- The invite code comes from `Math.random()`. `crypto.getRandomValues` works
  in insecure contexts too, so the code comment's reason for avoiding it
  doesn't apply.

### S3 — SSRF gaps in recipe-link import (`parse-recipe/scrape.ts`)
- `new URL('http://[::1]/').hostname` is `"[::1]"` (with brackets), so the
  `=== '::1'` check misses it. The same goes for `[::ffff:127.0.0.1]`,
  `[fd..]`, and `[fe80..]`.
- `fetch` follows redirects by default. Only the *first* URL is validated,
  so a public URL that 302s to `http://169.254.169.254/` gets through.
- Failed scrapes don't count toward the daily limit, so outbound fetches are
  unlimited.

### S4 — OAuth race conditions (`mcp/oauth/`)
- `consumeAuthorizationCode` (`store.ts`) reads the code, then marks it used
  in a separate step, so two simultaneous exchanges can both mint tokens.
- `rotateRefreshToken` (`tokenStore.ts`) has the same read-then-update race.
  It also doesn't check that the refresh token belongs to the calling
  `client_id`, and it doesn't detect reuse (a revoked refresh token being
  presented again should revoke that grant's live tokens).
- Refresh tokens never expire.

### S5 — Minor security
- The `mcp_tokens` policies (`0022`) use the raw `household_members`
  subquery instead of `is_household_member()`, which is inconsistent with
  every other table.
- The `mcp_tokens` UPDATE policy allows any column, so a member can
  un-revoke a token or rewrite `token_hash`.
- `households` INSERT is `with check (true)` and `created_by` is
  client-supplied.

### R1 — Multi-write flows aren't atomic
- `markPurchased`/`undoPurchase` (`src/features/shopping/purchase.ts`) and
  the MCP copy (`mcp/tools/purchase.ts`) run 2–3 separate writes.
- If the pantry write succeeds and the shopping update fails, the pantry is
  updated but the item is still pending. A retry then adds it twice.
- Same pattern in `createHousehold` (household created, but no owner
  membership row) and `joinHousehold`.

### R2 — Failed meal suggestions are cached as if real
- In `suggest-meals/index.ts`, when Gemini fails, `FALLBACK_MEALS` is
  inserted under the same `prompt_hash` as a real result.
- The next non-regenerate request then serves the staples as a cache hit
  until the pantry changes.

### R3 — No timeout on Gemini calls
- `suggest-meals/gemini.ts` and `parse-recipe/gemini.ts` call `fetch` with no
  `signal`, so a hung upstream holds the function until the platform kills it.

### R4 — Rate-limit check-then-insert is racy
The limit is counted first and inserted afterwards, so simultaneous requests
can slightly exceed it. This is acceptable at this scale; noted only.

### D1 — Missing indexes (Postgres doesn't index foreign keys automatically)
- `shopping_items(household_id, status)`
- `pantry_items(household_id, status)`
- `pantry_items(source_item_id)` — used by undo
- `oauth_tokens(household_id)`
- `invites(household_id)`

### D2 — Tables that only grow
`meal_suggestions`, `recipe_parses`, expired `oauth_authorization_codes`,
revoked `oauth_tokens`, and expired `invites` are never cleaned up.

### D3 — Enum lists duplicated in many places
The category list lives in 2 SQL check constraints, 2 Gemini response
schemas, `mcp/domain.ts`, and `src/shared/categories.ts`. The unit list is
duplicated in a similar number of places. Every change needs a
drop-and-recreate migration plus edits in 4+ files.

### P1 — Performance (low priority)
- Purchase downloads the whole available pantry to find a matching name.
- Every MCP call writes `last_used_at`.

Both are fine at 2 users. The purchase one goes away with the R1 fix.

### O1 — Observability
- Edge functions only `console.error` on failure.
- Nothing records LLM latency, fallback rate, cache hit rate, or 429s.
- There is no client-side error capture, so a failed mutation on a phone is
  invisible to you.

### A1 — Docs and ADRs
- There is no `docs/adr/`. Decisions and their reversals (e.g. `0006` removed
  quantity/unit; `0019`/`0020` restored them) live only in migration comments.
- `README.md` contradicts `CLAUDE.md`. It says "**One** Edge Function", "no
  unit/number split", and "every prompt lives in `suggest-meals/prompt.ts`".
  All three are now wrong. The "In progress (2026-09-21)" status is stale.
- `CLAUDE.md` links to a plan file at a Windows path that isn't in the repo.
- The CI workflow only deploys `suggest-meals`. `parse-recipe` and `mcp` are
  deployed by hand, and that isn't recorded as a decision.

### X1 — Simplification
- The purchase orchestration is written twice (client and MCP). `mcp/domain.ts`
  is a hand-synced copy of 5 domain files (Deno can't import the Vite-style
  extensionless paths).
- `CORS_HEADERS` and `json()` are redefined in 4 places. The auth →
  membership → daily-limit block is copy-pasted between `suggest-meals` and
  `parse-recipe`.

---

## Part 2 — Remediation plan

Phases run in order, and each ends in a working, deployable state.
Verification is manual (browser, plus SQL via the Supabase dashboard or MCP),
because this environment has no Node.

Deploy commands, run from the repo root:
- migrations: `supabase db push`
- functions: `supabase functions deploy <name>`
- frontend: push to `main` (Netlify auto-deploys)

---

### Phase 0 — Check whether S1 was already exploited (do first, read-only)

**Step 0.1 — Look for unexpected memberships.**

```sql
select hm.household_id, h.name, hm.user_id, u.email, hm.role, hm.joined_at,
       h.created_by = hm.user_id                                   as is_creator,
       exists (select 1 from invites i
               where i.household_id = hm.household_id
                 and i.used_by = hm.user_id)                       as via_invite
from household_members hm
join households h on h.id = hm.household_id
join auth.users u on u.id = hm.user_id
order by hm.household_id, hm.joined_at;
```

Any row where both `is_creator` and `via_invite` are false is a membership
that didn't come through the normal flow. Remove it with
`delete from household_members where household_id = … and user_id = …`, and
revoke any `mcp_tokens` / `oauth_tokens` that user created.

**Step 0.2 — Check `auth.users` for accounts you don't recognise.**
Delete any from the dashboard (Authentication → Users).

**Step 0.3 — Check the hosted auth settings.**
In the dashboard, under Authentication → Providers → Email, check "Confirm
email" and "Allow new users to sign up". `config.toml` only covers local
dev. Consider turning on email confirmation. For a 2-person app, you could
also disable signups after both accounts exist.

---

### Phase 1 — Close the household-join hole (S1, S2, S5 part)

The order matters: add the new RPCs → ship the frontend that uses them →
only then drop the old policies. Otherwise joining breaks in between.

**Step 1.1 — Migration `0025_household_rpcs.sql` (additive only).**

```sql
-- Household creation and invite redemption move server-side. The client
-- used to do these as 2-3 separate writes guarded only by permissive RLS,
-- which let any signed-in user insert themselves into any household (see
-- design-review-plan.md S1). These run as the table owner, so they check
-- everything themselves, in one transaction.

create or replace function create_household(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'already_in_household';
  end if;

  insert into households (name, created_by)
  values (coalesce(nullif(trim(p_name), ''), 'Our household'), auth.uid())
  returning id into v_id;

  insert into household_members (household_id, user_id, role)
  values (v_id, auth.uid(), 'owner');

  return v_id;
end;
$$;

create or replace function redeem_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite invites;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'already_in_household';
  end if;

  select * into v_invite from invites
  where code = upper(trim(p_code))
  for update;

  if not found then raise exception 'invite_not_found'; end if;
  if v_invite.used_by is not null then raise exception 'invite_used'; end if;
  if v_invite.expires_at < now() then raise exception 'invite_expired'; end if;

  update invites set used_by = auth.uid() where code = v_invite.code;

  insert into household_members (household_id, user_id, role)
  values (v_invite.household_id, auth.uid(), 'member');

  return v_invite.household_id;
end;
$$;

revoke all on function create_household(text) from public, anon;
revoke all on function redeem_invite(text) from public, anon;
grant execute on function create_household(text) to authenticated;
grant execute on function redeem_invite(text) to authenticated;
```

Deploy with `supabase db push`. Nothing breaks yet, because the old
policies still exist.

**Step 1.2 — Frontend: `src/features/household/api.ts` and `invites.ts`.**
- `createHousehold(name)`: call `supabase.rpc('create_household', { p_name: name })`,
  then fetch the row with `.from('households').select(HOUSEHOLD_COLUMNS).eq('id', id).single()`.
  Remove the direct inserts and the `getUser()` call.
- `joinHousehold(code)`: call `supabase.rpc('redeem_invite', { p_code: code })`,
  then fetch the household the same way. Map the error messages
  `invite_not_found` / `invite_used` / `invite_expired` / `already_in_household`
  to the existing user-facing strings. Remove the select, claim, and insert
  steps.
- `randomCode()`: replace `Math.random()` with
  `crypto.getRandomValues(new Uint32Array(length))`, taking each value
  modulo the alphabet length, and update the comment.
  (`getRandomValues` works on plain-HTTP LAN addresses; `randomUUID` does not.)

Push to `main`, then check that creating and joining a household still work
in the deployed app.

**Step 1.3 — Migration `0026_lock_down_household_join.sql`.**

```sql
-- Now that create_household()/redeem_invite() own these writes (0025),
-- remove the client-side paths that allowed joining any household.
drop policy "user can insert their own membership" on household_members;
drop policy "creator can insert a household" on households;
drop policy "authenticated can look up an invite by code" on invites;
drop policy "authenticated can claim an unused invite" on invites;

-- Members can still see their own household's invites (not used by the
-- app today; harmless and useful for a future "pending invites" view).
create policy "member can read household invites"
  on invites for select
  using (is_household_member(household_id));

-- mcp_tokens: same membership helper as every other table (S5).
drop policy "member can read household mcp tokens" on mcp_tokens;
drop policy "member can create household mcp tokens" on mcp_tokens;
drop policy "member can revoke household mcp tokens" on mcp_tokens;

create policy "member can read household mcp tokens"
  on mcp_tokens for select using (is_household_member(household_id));

-- Issuance goes through the mcp function (service role); no client insert.
-- Revoke only: only revoked_at may change, and only to non-null.
create policy "member can revoke household mcp tokens"
  on mcp_tokens for update
  using (is_household_member(household_id))
  with check (is_household_member(household_id) and revoked_at is not null);

revoke update on mcp_tokens from authenticated;
grant update (revoked_at) on mcp_tokens to authenticated;
```

**Checks after Step 1.3:**
- Rerun the `pg_policies` query from the review: `household_members` should
  have no INSERT policy, and `invites` should have no world-readable SELECT.
- From the browser console, signed in as a test user who isn't a member,
  run `await supabase.from('invites').select('*')`. It should return `[]`.
- As the same user, `supabase.from('household_members').insert({...})`
  should fail with an RLS error.
- A fresh invite code still works end to end, and redeeming it twice fails
  with "already used".
- MCP token create and revoke still work from Settings.

---

### Phase 2 — Edge-function security (S3, S4)

**Step 2.1 — SSRF hardening in `supabase/functions/parse-recipe/scrape.ts`.**
- In `assertSafeUrl`: strip the brackets
  (`hostname.replace(/^\[|\]$/g, '')`) before any check. Treat
  `::`, `::1`, `::ffff:*` (check the embedded IPv4 against the same private
  ranges), `fc*`, `fd*`, and `fe80:*` as private. Add `100.64.0.0/10`
  (carrier-grade NAT) and `0.0.0.0/8`.
- In `scrapeRecipePage`: fetch with `redirect: 'manual'` in a loop of at most
  5 hops. On a 3xx, resolve `Location` against the current URL, run
  `assertSafeUrl` on it, and continue.
- Optional, closes DNS rebinding: before each fetch, resolve the host with
  `Deno.resolveDns(host, 'A')` / `'AAAA'` and reject if any answer is
  private. Only do this if `Deno.resolveDns` is available on Supabase Edge;
  otherwise keep documenting it as an accepted gap.

**Step 2.2 — Count scrape attempts toward the limit.**
In `parse-recipe/index.ts`, insert into `recipe_parses` before the scrape as
well, or give scrapes their own lower daily cap. This stops unlimited
outbound fetches.

**Step 2.3 — Atomic auth-code consumption (`mcp/oauth/store.ts`).**
Replace the select-then-update with one conditional update:

```ts
const now = new Date().toISOString()
const { data: row } = await admin
  .from('oauth_authorization_codes')
  .update({ used_at: now })
  .eq('code_hash', codeHash)
  .is('used_at', null)
  .gt('expires_at', now)
  .select('id, client_id, household_id, user_id, redirect_uri, code_challenge')
  .maybeSingle()
return row
```

**Step 2.4 — Safe refresh-token rotation (`mcp/oauth/tokenStore.ts`, `token.ts`).**
- Change the signature to `rotateRefreshToken(raw, clientId)` and pass
  `clientId` from `handleToken`.
- Do a single conditional update:
  `update({ revoked_at: now }).eq('refresh_token_hash', h).eq('client_id', clientId).is('revoked_at', null).select(...).maybeSingle()`.
- If no row comes back, look the hash up again without the `revoked_at`
  filter. If it exists but is already revoked, that's reuse: revoke every
  non-revoked `oauth_tokens` row for that `client_id` + `household_id`, then
  return `invalid_grant`.
- Add a `refresh_token_expires_at` column (migration `0027`; e.g. 90 days)
  and reject refreshes after it.

**Checks:**
- `http://[::1]/` returns the 422 error.
- A redirector URL pointing at `169.254.169.254` is rejected.
- Exchanging the same auth code twice gives one success and one
  `invalid_grant`.
- Replaying an old refresh token returns `invalid_grant`, and the Gemini
  connection then needs reconnecting.

Deploy `parse-recipe` and `mcp`.

---

### Phase 3 — Reliability (R1, R2, R3)

**Step 3.1 — Don't cache fallback suggestions (`suggest-meals/index.ts`).**
Keep inserting fallback rows, because they still cost a Gemini attempt and
should count toward the limit. In the cache lookup, only match real results:

```ts
.eq('prompt_hash', hash)
.eq('payload->>fallback', 'false')
```

Also exclude fallback rows from the `recentRows` query, because staples
shouldn't count as "recent meals".

**Step 3.2 — Gemini timeouts.**
In both `gemini.ts` files, add `signal: AbortSignal.timeout(25_000)` to the
`fetch`. The existing catch paths already handle a thrown error: fallback in
`suggest-meals`, 502 in `parse-recipe`.

**Step 3.3 — Atomic purchase and undo (`0028_purchase_rpcs.sql`).**
Move the purchase transition into one transaction, so both the client and
MCP call the same code.

> **Decision needed (record as an ADR, see Phase 6).** This moves
> merge-on-purchase logic (name normalization, unit conversion, details
> merge) into SQL. That conflicts with CLAUDE.md's "domain logic lives in
> `src/domain/`" rule for this one flow. The payoff: atomicity, one
> implementation instead of two, and no downloading the whole pantry.
> The TS domain functions stay for the other flows that use them
> (add-to-list merge, "cooked this"). If you'd rather keep all logic in TS,
> the alternative is an RPC that takes the client-computed pantry
> write as `jsonb` and applies both writes atomically. That fixes atomicity,
> but not the MCP duplication.

```sql
create or replace function normalize_name(n text) returns text
language sql immutable as $$
  select lower(regexp_replace(trim(n), '\s+', ' ', 'g'))
$$;

create or replace function convert_quantity(q numeric, from_unit text, to_unit text)
returns numeric language sql immutable as $$
  select case
    when from_unit = to_unit then q
    when from_unit = 'kg' and to_unit = 'g'  then q * 1000
    when from_unit = 'g'  and to_unit = 'kg' then q / 1000
    when from_unit = 'l'  and to_unit = 'ml' then q * 1000
    when from_unit = 'ml' and to_unit = 'l'  then q / 1000
  end
$$;

create or replace function merge_details(a text, b text) returns text
language sql immutable as $$
  select case
    when nullif(trim(a), '') is null then nullif(trim(b), '')
    when nullif(trim(b), '') is null then trim(a)
    when trim(a) = trim(b) then trim(a)
    else trim(a) || ', ' || trim(b)
  end
$$;

-- security invoker: RLS applies for app users. The mcp function calls it with
-- the service role and must pass its token-scoped household id, which is
-- checked below either way.
create or replace function purchase_shopping_item(p_item_id uuid, p_household_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_item  shopping_items;
  v_match pantry_items;
begin
  select * into v_item from shopping_items
  where id = p_item_id and household_id = p_household_id and status = 'pending'
  for update;
  if not found then raise exception 'item_not_pending'; end if;

  select * into v_match from pantry_items
  where household_id = p_household_id
    and status = 'available'
    and normalize_name(name) = normalize_name(v_item.name)
    and convert_quantity(v_item.quantity, v_item.unit, unit) is not null
  order by added_at
  limit 1
  for update;

  if found then
    update pantry_items
    set quantity = quantity + convert_quantity(v_item.quantity, v_item.unit, unit),
        details  = merge_details(details, v_item.details)
    where id = v_match.id;
  else
    insert into pantry_items (household_id, name, details, category, quantity, unit, source_item_id, status)
    values (p_household_id, v_item.name, v_item.details, v_item.category,
            v_item.quantity, v_item.unit, v_item.id, 'available');
  end if;

  update shopping_items set status = 'purchased', purchased_at = now()
  where id = v_item.id;
end;
$$;

create or replace function undo_purchase(p_item_id uuid, p_household_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from pantry_items
  where source_item_id = p_item_id and household_id = p_household_id and status = 'available';

  update shopping_items set status = 'pending', purchased_at = null
  where id = p_item_id and household_id = p_household_id;
end;
$$;

grant execute on function purchase_shopping_item(uuid, uuid) to authenticated;
grant execute on function undo_purchase(uuid, uuid) to authenticated;
```

Small behaviour change to note in the ADR: the old code gave up if the
*first* name match had an incompatible unit. The SQL version looks for a
matching row whose unit *is* compatible, which is strictly better.

**Step 3.4 — Switch the callers.**
- `src/features/shopping/purchase.ts`: `markPurchased` becomes
  `supabase.rpc('purchase_shopping_item', { p_item_id: item.id, p_household_id: item.household_id })`,
  and `undoPurchase` becomes the same pattern with `undo_purchase`. The file
  comment moves to the migration.
- `supabase/functions/mcp/tools/purchase.ts`: call
  `admin.rpc('purchase_shopping_item', { p_item_id: itemId, p_household_id: householdId })`
  and map `item_not_pending` to "Shopping item not found".
- Delete whatever `mcp/domain.ts` exports become unused, and check every
  other importer first.
- Check for other multi-write flows that need the same treatment:
  `useAddAndPurchase.ts`, `useAddIngredientsToShopping.ts`, and "cooked
  this" / consume in the pantry and meals features.

**Step 3.5 — SQL checks.**
Add `supabase/tests/purchase.sql`: `begin; … assertions …; rollback;`
scripts to run through the Supabase SQL editor or the MCP `execute_sql`.
They should cover:
- a new row
- a merge with a kg↔g conversion
- a kg vs ml pair, which should insert a second row
- a details merge
- a double purchase, which should error
- undo

**Checks:**
- Buy an item that's already in the pantry: one merged row.
- Buy it again after undo: this works.
- Buy through the MCP connector: same result as the app.

---

### Phase 4 — Data hygiene (D1, D2, D3)

**Step 4.1 — Migration `0029_indexes.sql`.**

```sql
create index if not exists shopping_items_household_status_idx on shopping_items (household_id, status);
create index if not exists pantry_items_household_status_idx  on pantry_items (household_id, status);
create index if not exists pantry_items_source_item_idx       on pantry_items (source_item_id);
create index if not exists oauth_tokens_household_idx         on oauth_tokens (household_id);
create index if not exists invites_household_idx              on invites (household_id);
create index if not exists household_members_user_idx         on household_members (user_id);
```

(`household_members_user_idx` speeds up `is_household_member()`, which
every RLS check calls. The primary key leads with `household_id`, so it
doesn't cover a lookup by `user_id` alone.)

**Step 4.2 — Retention job.**
Enable `pg_cron` (Dashboard → Database → Extensions), then add migration
`0030_retention.sql`:

```sql
select cron.schedule('fridger-retention', '0 3 * * 0', $$
  delete from meal_suggestions          where created_at  < now() - interval '30 days';
  delete from recipe_parses             where created_at  < now() - interval '7 days';
  delete from oauth_authorization_codes where expires_at  < now() - interval '1 day';
  delete from oauth_tokens              where revoked_at  < now() - interval '30 days';
  delete from invites                   where expires_at  < now() - interval '30 days';
$$);
```

Purchased `shopping_items` and consumed `pantry_items` are kept as history
on purpose (plan §3). Leave them alone unless you decide otherwise.

**Step 4.3 — One source of truth for categories and units on the Deno side.**
- Create `supabase/functions/_shared/constants.ts` exporting `UNITS` and
  `CATEGORIES`.
- Have both `gemini.ts` `RESPONSE_SCHEMA`s, `suggest-meals/schema.ts`, and
  `mcp/domain.ts` import from it. Use explicit `.ts` extensions, which Deno
  needs.
- The SQL check constraints and `src/shared/categories.ts` stay separate
  (different runtimes). Add a comment in each file listing the other places
  that must change together.

---

### Phase 5 — Observability (O1)

**Step 5.1 — Structured logs in edge functions.**
Add `supabase/functions/_shared/log.ts`:

```ts
export function logEvent(fn: string, event: string, fields: Record<string, unknown>) {
  console.log(JSON.stringify({ fn, event, ts: new Date().toISOString(), ...fields }))
}
```

Emit one line per request at the key outcomes:
- `suggest-meals`: `{ event: 'suggest', householdId, cached, fallback, latencyMs, status }`
- `parse-recipe`: `{ event: 'parse', inputType, ok, latencyMs, status }`
- `mcp`: `{ event: 'tool', tool, ok }` and `{ event: 'auth_fail', kind }`
- every 429: `{ event: 'rate_limited' }`

Query them in Dashboard → Logs → Edge Functions (filter on
`event_message` containing `"event":"suggest"`), or through the MCP
`get_logs`.

**Step 5.2 — LLM health check query.**
Save this in the dashboard's SQL snippets:

```sql
select date_trunc('day', created_at) as day,
       count(*) filter (where payload->>'fallback' = 'true')  as fallbacks,
       count(*)                                                as total
from meal_suggestions
group by 1 order by 1 desc limit 14;
```

**Step 5.3 — Client error capture (no new dependency).**
Migration `0031_client_errors.sql`: a `client_errors` table
(`id, household_id, user_id default auth.uid(), message, stack, url,
created_at`) with an insert-only RLS policy for members, and a 30-day
retention line added to the cron job.

In `src/main.tsx`:
- Add a `QueryCache`/`MutationCache` `onError` that inserts a row
  (throttled: at most 1 per message per minute).
- Add a `window.addEventListener('error' / 'unhandledrejection')`.

(Sentry would be better, but CLAUDE.md requires asking before adding
dependencies. Ask if you'd rather go that way.)

**Step 5.4 — Deploy CI for all functions.**
In `.github/workflows/deploy-suggest-meals.yml`:
- Rename it to `deploy-functions.yml`.
- Widen `paths` to `supabase/functions/**`.
- Run `supabase functions deploy --project-ref …` with no function name, so
  every function is deployed. Otherwise, add a matrix step per function.

---

### Phase 6 — Docs and ADRs (A1)

**Step 6.1 — Create `docs/adr/`** with a short template (Context / Decision /
Consequences / Status). Backfill these, 10–20 lines each:
- `0001-supabase-only-no-backend.md` — Supabase + Edge Functions instead of FastAPI (plan §2)
- `0002-polling-over-realtime.md` — `refetchInterval` 10s, not Realtime
- `0003-quantity-unit-reversal.md` — 0006 removed quantity/unit, 0019/0020 restored a fixed-unit version; why
- `0004-llm-fallback-policy.md` — fixed staples or an honest "try again", no rule engine; fallback results are not cached (Phase 3.1)
- `0005-mcp-auth-static-token-and-oauth.md` — static tokens for Claude, OAuth 2.1 + DCR for Gemini/ChatGPT; accepted DCR consent-phishing risk
- `0006-household-writes-via-rpc.md` — Phase 1 and 3.3: membership, purchase and undo move into Postgres functions; the exception to the domain-in-TS rule
- `0007-ssrf-posture.md` — what the scraper blocks and the accepted gaps

**Step 6.2 — Fix `README.md` drift.**
- "One Edge Function" → three (`suggest-meals`, `parse-recipe`, `mcp`).
- Replace "no unit/number split" with the current quantity + fixed-unit rule
  (point to CLAUDE.md).
- The prompt boundary covers every function's `prompt.ts`, not only
  `suggest-meals`.
- Remove or refresh the stale "In progress (2026-09-21)" block.
- Add a link to `docs/adr/`.

**Step 6.3 — Fix `CLAUDE.md`.**
- Remove the dead `C:\Users\...` plan path.
- Add the new rule: "household membership, purchase and undo writes go
  through Postgres functions — never direct multi-table writes from the
  client".
- Point to `docs/adr/`.
- Document `supabase/functions/_shared/`.

---

### Phase 7 — Simplification (X1)

**Step 7.1 — `supabase/functions/_shared/http.ts`.**
- Export `CORS_HEADERS` and `json(body, status)`.
- Replace the copies in `suggest-meals/index.ts`, `parse-recipe/index.ts`,
  `mcp/index.ts`, `mcp/tokens.ts`, and `mcp/oauth/*.ts`.
- `mcp` keeps its extra `Access-Control-Expose-Headers` by spreading the
  shared headers.

**Step 7.2 — `supabase/functions/_shared/guard.ts`.**
- Export `requireMember(req, householdId)`, which returns `{ user }` or a
  401/403 `Response`.
- Export `underDailyLimit(table, householdId, limit)`.
- Use them in `suggest-meals` and `parse-recipe`. `mcp/auth.ts`'s
  `verifyHouseholdMember` can wrap `requireMember`.

**Step 7.3 — Shrink `mcp/domain.ts`.**
After Phase 3.4, keep only what the remaining MCP tools use
(`isSameIngredient`, `mergeQuantity` and `mergeDetails` for add-to-list
merging, the category and unit constants from `_shared/constants.ts`).
Update its header comment.

---

## Summary checklist

- [ ] 0.1–0.3 Audit memberships, users, and hosted auth settings
- [ ] 1.1 `0025` create_household / redeem_invite RPCs
- [ ] 1.2 Frontend uses RPCs; secure invite codes
- [ ] 1.3 `0026` drop permissive policies; lock down `mcp_tokens`
- [ ] 2.1 SSRF: IPv6 brackets, mapped IPv4, manual redirects
- [ ] 2.2 Scrapes count toward limit
- [ ] 2.3 Atomic auth-code consume
- [ ] 2.4 Refresh rotation: client check, reuse detection, expiry (`0027`)
- [ ] 3.1 Don't cache or serve fallback suggestions
- [ ] 3.2 Gemini timeouts
- [ ] 3.3 `0028` purchase / undo RPCs
- [ ] 3.4 Client and MCP call the RPCs
- [ ] 3.5 SQL check scripts
- [ ] 4.1 `0029` indexes
- [ ] 4.2 `0030` pg_cron retention
- [ ] 4.3 `_shared/constants.ts`
- [ ] 5.1 Structured logs
- [ ] 5.2 Fallback health query
- [ ] 5.3 `0031` client error capture
- [ ] 5.4 CI deploys all functions
- [ ] 6.1 ADRs 0001–0007
- [ ] 6.2 README fixes
- [ ] 6.3 CLAUDE.md fixes
- [ ] 7.1 `_shared/http.ts`
- [ ] 7.2 `_shared/guard.ts`
- [ ] 7.3 Trim `mcp/domain.ts`
