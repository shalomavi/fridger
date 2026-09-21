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
  different product from the personal Gemini app. The consumer app's
  "Connected Apps" MCP option does require full OAuth 2.1 + Dynamic Client
  Registration, confirmed empirically (§7c) — a full OAuth authorization
  server was built for it, verified working end-to-end by hand, but
  Gemini's own connector UI still rejects it with no diagnosable error.
  Currently blocked on Gemini's platform, not on anything in this repo.

---

## 2. Auth: a per-household access token (v1) — covers Claude only

(An OAuth 2.1 authorization server for clients that need it — Gemini,
confirmed, and likely ChatGPT — was later built alongside this; see §9.
This section describes the original, still-current Claude path.)

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

## 7b. ChatGPT — OAuth server now exists, untested against ChatGPT itself

ChatGPT's custom MCP connectors require OAuth 2.1 with Dynamic Client
Registration; there is no bearer-token or API-key option. The OAuth server
built for Gemini (§7c, §9) implements exactly this and should serve ChatGPT
too without further backend work — it was designed to be client-agnostic.
Not yet actually tried against a ChatGPT connector; that's the next step
whenever there's a reason to add ChatGPT specifically. Worth re-running the
same empirical-first approach used for Gemini (§7c) rather than assuming it
will just work.

## 7c. Gemini — built, verified end-to-end by hand, blocked on Gemini's side

Confirmed empirically: the personal Gemini app's "Connected Apps" MCP
option requires full OAuth 2.1 + Dynamic Client Registration — no
bearer/static-header fallback exists on that surface (the UI's own probe
of a bearer-only URL returns "Gemini requires standard OAuth for server
connections").

An OAuth 2.1 authorization server was built in response (§9) and every
piece of it was verified directly (not just "should work"):

- Discovery documents resolve correctly in all three conventions a client
  might use: root-level (`/.well-known/oauth-authorization-server`, proxied
  via Netlify since Supabase's function routing can't serve root-level
  paths — see §9), the plain suffix form under `/mcp`, and RFC 8414's
  path-insertion form.
- The `401` response from `/mcp` carries a correct
  `WWW-Authenticate: Bearer resource_metadata="..."` header, with
  `Access-Control-Expose-Headers` set so browser-side code can actually
  read it.
- `POST /register` (DCR) issues a working client_id/secret.
- `GET /authorize` redirects correctly to the SPA's `/connect` consent
  screen with all params forwarded.
- Manually registering a client with the exact redirect URI Gemini's own
  dialog generates, then pasting that client_id/secret into Gemini's
  "Additional settings" fields, still didn't get past Gemini's UI.

Despite all of that, Gemini's connector dialog still shows "This MCP server
uses an authentication method that Gemini doesn't support" — a message that
turned out to be a static one-time check tied to the URL field, not a live
per-attempt probe result (it didn't change after entering valid
credentials, retrying, or waiting out a possible cache). Browser DevTools
showed no direct request from the browser to our domain at all during the
attempt — Gemini's own backend does the actual server-to-server probing,
which is entirely opaque to us; there's no way to see what request it sends
or why it decides the server is unsupported.

Ruled out along the way: caching (cache-busted URLs didn't help), the
account-eligibility prerequisites Google documents (18+, US, personal
Google Account, English — all confirmed to apply here).

**Conclusion**: this is blocked on Gemini's platform behavior, not on
anything in this repo. Revisit if Google's implementation matures, or if
tackling ChatGPT (§7b) first turns out to shake something loose here too
(same server, so worth re-testing Gemini after that).

---

## 9. OAuth 2.1 authorization server (built for §7b/§7c)

Added alongside the v1 static-token path (§2), not replacing it — Claude's
setup (§7a) is untouched; `verifyBearerToken` in `auth.ts` now checks an
OAuth access token first, falling back to `mcp_tokens`.

**New tables** (`0023_oauth.sql`), all RLS-enabled with no policies —
service-role only, same posture as everything else the `mcp` function's
admin client touches:

```
oauth_clients               id, client_id, client_secret_hash, client_name,
                             redirect_uris, created_at
oauth_authorization_codes   id, code_hash, client_id, household_id, user_id,
                             redirect_uri, code_challenge,
                             code_challenge_method, expires_at, used_at
oauth_tokens                id, client_id, household_id, user_id,
                             access_token_hash, access_token_expires_at,
                             refresh_token_hash, revoked_at, last_used_at
```

**New files** under `supabase/functions/mcp/oauth/`: `store.ts` (clients +
auth codes), `tokenStore.ts` (access/refresh tokens, connections
list/revoke), `pkce.ts` (S256 check), `metadata.ts` (discovery documents),
`register.ts` (DCR + public client-name lookup), `authorize.ts` (GET
validate+redirect to the SPA, POST approve from the SPA), `token.ts`
(authorization_code and refresh_token grants). `shared.ts` holds
`admin`/`sha256Hex`/`generateRawToken`, split out of `auth.ts` to avoid a
circular import with `oauth/tokenStore.ts`.

**Frontend**: `src/features/oauthConsent/` (the `/connect` consent screen,
reachable outside the app's nav chrome) and
`src/features/settings/ConnectedAppsSettings.tsx` (list/revoke OAuth
grants — these rows have no client-side RLS access, unlike `mcp_tokens`,
so it goes through `/oauth/connections` instead of a direct table query).

**Routing quirk**: Supabase Edge Functions route requests by matching the
function name as the first path segment, so a request to
`/.well-known/oauth-authorization-server` (no `/mcp` prefix) 404s at the
gateway before ever reaching Deno code — confirmed by curling it directly.
`public/_redirects` proxies the root-level and RFC 8414 path-insertion
`.well-known` conventions through Netlify (which has no such routing
restriction) to the real Supabase endpoints, so a client using either
convention can still find them.

## 8. Non-goals

- No public connector-directory listing — this is a private household
  tool, not a published integration.
- No write access beyond the tools listed above (no deleting items, no
  editing household preferences/settings via the LLM) — keep the blast
  radius of a leaked or misused token small.
- No new ingredient/unit logic introduced for the LLM's benefit — the
  `details` free-text field and existing name normalization
  (see `CLAUDE.md`) are reused as-is, not redesigned for this feature.
