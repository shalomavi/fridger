# MCP Connector — Exposing Fridger to Claude/ChatGPT/Gemini

Plan for a remote MCP server that lets an LLM app read and act on a household's
shopping list, pantry, and meal suggestions — "add milk to the list", "what's
expiring soon", "suggest a meal" — from Claude, ChatGPT, or Gemini directly.

---

## 1. Why one MCP server, not three integrations

MCP is what Claude speaks natively, and both OpenAI (ChatGPT connectors) and
Google are converging on it too. One server gets the widest reach instead of
building a bespoke integration per app — but "one server" doesn't mean "one
identical setup": each app's auth requirements differ enough that they change
how much of this plan applies to each (see §2 and §7a-c). Verified, as of
this plan being written:

- **Claude**: supports a plain static bearer token/API-key header
  (`static_headers`, beta) for custom connectors, not just OAuth. This is
  the guaranteed v1 target.
- **ChatGPT**: custom MCP connectors require full **OAuth 2.1 with Dynamic
  Client Registration** — bearer tokens are not accepted, no matter the
  header name. Supporting ChatGPT means standing up a real OAuth
  authorization server, not just adding a field to the existing token
  model. Treated as a deferred v2 phase (§7b), not part of v1.
- **Gemini**: solid custom-MCP support exists for **Gemini
  Business/Enterprise** (GCP service-account auth, admin-configured) — a
  different product from the personal Gemini app. The consumer app has a
  "Connected Apps" MCP option, but it's new enough that its auth model for
  an individual account isn't confirmed yet. Treated as "verify
  empirically, best effort" (§7c).

---

## 2. Auth: a per-household access token (v1) — covers Claude only

MCP's spec wants OAuth for servers listed in a public connector directory,
but this isn't going into a directory — it's one household connecting its own
data. A long random bearer token is enough for Claude specifically (see §1),
and is dramatically less to build and audit than an OAuth server. This does
**not** extend to ChatGPT (§7b) — that requires OAuth regardless of what's
built here.

**New table**, RLS-scoped like everything else in this app:

```
mcp_tokens   id, household_id, user_id, token_hash, label,
             created_at, last_used_at, revoked_at
```

- A household member can list/revoke their household's tokens (label +
  created date only) and create new ones.
- The raw token is shown exactly once, at creation — only its hash is
  stored, and only the `mcp` Edge Function (service role) ever reads
  `token_hash`, to verify an incoming request.
- The LLM app sends the token as a `Bearer` header on every MCP call. The
  function hashes it, looks up the row, and resolves the household from
  there — the caller never supplies a `household_id` itself. This is
  actually simpler than `suggest-meals/index.ts`'s current pattern (client
  sends `householdId`, function cross-checks membership): here there's
  nothing to cross-check, since the token itself is already scoped to
  exactly one household.

---

## 3. The MCP server: `supabase/functions/mcp/`

Same shape as the existing `suggest-meals` function — a Deno Edge Function,
service-role Supabase client inside, CORS headers on every response — but
speaking the MCP Streamable HTTP protocol instead of a one-shot POST.

**Tools, v1:**

| Tool | Maps to |
|---|---|
| `get_shopping_list` | `listShoppingItems` |
| `add_shopping_item` | `addShoppingItem` |
| `mark_item_purchased` | `markPurchased` |
| `get_pantry` | `listPantryItems` |
| `consume_pantry_item` | `consumeItem` |
| `suggest_meals` | proxies to `suggest-meals` |

`src/domain/` is plain framework-free TypeScript (no React, no Supabase
import) — the Edge Function should be able to import it directly rather than
duplicating logic, pending confirming the import resolves cleanly through
Deno's import map from `supabase/functions/mcp/`.

**Dependency decision, flagged per this repo's "no new dependencies without
asking" rule:** the function needs either the official
`@modelcontextprotocol/sdk` (via Deno's `npm:` specifier, same style as
`@supabase/supabase-js` in `suggest-meals`) or a hand-rolled JSON-RPC
handler. Recommendation: use the SDK — the protocol has enough edge cases
(capability negotiation, streaming, error shapes) that hand-rolling it is a
bad place to save one dependency.

---

## 4. Settings UI

A small "Connect an AI assistant" section in `SettingsScreen`:
generate a token (shown once, with a copy button and a clear "you won't see
this again" warning), list existing tokens by label/date, revoke one.

---

## 5. Testing

`npx @modelcontextprotocol/inspector` against the local Edge Function
(`supabase functions serve mcp`) before pointing any real client at it —
verify each tool call, and that a request with a missing/revoked/wrong-format
token is rejected before it touches household data.

---

## 6. Rollout order

1. **Stub connector first**: a bare `mcp` Edge Function with one dummy tool
   (e.g. `ping`), no real data wiring, deployed and connected to Claude with
   a static bearer token (§7a). Confirms, on the actual account, that the
   `static_headers` beta option is visible and that Claude actually sends
   the token as expected — before investing in the rest of the build. ~1
   hour of work; directly de-risks §2/§3 instead of trusting the beta
   documentation to hold.
2. `mcp_tokens` migration + RLS policies.
3. Settings UI to generate/revoke a token.
4. The real `mcp` Edge Function, tools one at a time (read-only tools first:
   `get_shopping_list`, `get_pantry` — lower blast radius than the write
   tools while the auth plumbing is still being proven out).
5. MCP Inspector testing.
6. Deploy and connect from Claude for real (§7a). ChatGPT (§7b) and Gemini
   (§7c) are separate, later efforts — not blocking this rollout.

---

## 7a. Connecting from the Claude app (including on the phone) — v1

Claude's connectors are tied to the Anthropic **account**, not a specific
device, so most of this is one-time setup done from wherever the fuller
settings UI lives — not something done separately on the phone.

1. **Function must be deployed** (§6) — a phone app can't reach a local
   `supabase functions serve` instance, only a real
   `https://<project>.functions.supabase.co/mcp`-style URL.
2. **Generate a household token** from Fridger's Settings screen (§4).
3. **Add the custom connector once**, from claude.ai (web) or the desktop
   app: Settings → Connectors → Add custom connector → choose request-header
   auth (`static_headers`, beta) → enter header name `authorization` (or
   `x-api-key`) with value `Bearer <token>` (or the raw token, depending on
   which header name is chosen) → paste the deployed URL. This step syncs
   to the account, so it does not need to be repeated on the phone.
4. **On the phone**, open a chat, enable the Fridger connector for that
   conversation (toggle/picker near the message box), and ask things like
   "what's on the shopping list" or "add eggs" — Claude calls the MCP tools
   from there.

If the `static_headers` beta option isn't visible on the account when this
is actually attempted, that's what step 1 of §6 (the stub connector) is for
catching early — fall back to checking whether the beta needs to be
explicitly enabled somewhere, before assuming the whole auth model needs to
change.

## 7b. ChatGPT — deferred, requires OAuth (not v1)

ChatGPT's custom MCP connectors require OAuth 2.1 with Dynamic Client
Registration; there is no bearer-token or API-key option. Supporting ChatGPT
means the `mcp` function also needs to act as a small OAuth authorization
server (or front one) — issuing/validating authorization codes and tokens
per the DCR flow — which is materially more than §2's token table. Not
worth building until Claude support (§7a) is proven out and there's an
actual reason to add ChatGPT specifically; tracked here as a known, larger
follow-up rather than folded into v1's scope.

## 7c. Gemini — best effort, verify empirically (not v1)

The personal Gemini app's "Connected Apps" MCP support is new enough that
its auth model for an individual account isn't confirmed by documentation
(the well-documented custom-MCP path is Gemini Business/Enterprise, a
different, admin-managed product). Once §7a is working, worth a quick
empirical check — try adding the same deployed URL as a Gemini "Connected
App" and see what it actually asks for — rather than designing auth for it
in advance. If it needs OAuth like ChatGPT, it likely piggybacks on
whatever gets built for §7b instead of needing a third auth model.

---

## 8. Non-goals for v1

- No OAuth / public connector-directory listing, and by extension **no
  ChatGPT support** (§7b) — this is a private household tool for Claude
  first, not a published integration.
- No write access beyond the tools listed above (no deleting items, no
  editing household preferences/settings via the LLM) — keep the blast
  radius of a leaked or misused token small.
- No new ingredient/unit logic introduced for the LLM's benefit — the
  `details` free-text field and existing name normalization
  (see `CLAUDE.md`) are reused as-is, not redesigned for this feature.
