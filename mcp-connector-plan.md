# MCP Connector — Exposing Fridger to Claude/ChatGPT/Gemini

Plan for a remote MCP server that lets an LLM app read and act on a household's
shopping list, pantry, and meal suggestions — "add milk to the list", "what's
expiring soon", "suggest a meal" — from Claude, ChatGPT, or Gemini directly.

---

## 1. Why one MCP server, not three integrations

MCP is what Claude speaks natively, and both OpenAI (ChatGPT connectors) and
Google are converging on it too. One server gets the widest reach instead of
building a bespoke integration per app. Claude's custom-connector support for
a plain remote MCP server is the most mature today; ChatGPT connectors and
Gemini's MCP support are newer and still rolling out — treat those as
"try it, may need adjusting," with Claude as the guaranteed target.

---

## 2. Auth: a per-household access token (v1), not full OAuth

MCP's spec wants OAuth for servers listed in a public connector directory,
but this isn't going into a directory — it's one household connecting its own
data. A long random bearer token is enough, and is dramatically less to build
and audit than an OAuth server.

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

1. `mcp_tokens` migration + RLS policies.
2. Settings UI to generate/revoke a token.
3. The `mcp` Edge Function itself, tools one at a time (read-only tools first:
   `get_shopping_list`, `get_pantry` — lower blast radius than the write
   tools while the auth plumbing is still being proven out).
4. MCP Inspector testing.
5. Deploy (`npx supabase functions deploy mcp`), then connect from Claude
   following §7 below, before trying ChatGPT/Gemini.

---

## 7. Connecting from the Claude app (including on the phone)

Claude's connectors are tied to the Anthropic **account**, not a specific
device, so most of this is one-time setup done from wherever the fuller
settings UI lives — not something done separately on the phone.

1. **Function must be deployed** (§6 step 5) — a phone app can't reach a
   local `supabase functions serve` instance, only a real
   `https://<project>.functions.supabase.co/mcp`-style URL.
2. **Generate a household token** from Fridger's Settings screen (§4).
3. **Add the custom connector once**, from claude.ai (web) or the desktop
   app: Settings → Connectors → Add custom connector → paste the deployed
   URL and the token. This step syncs to the account, so it does not need
   to be repeated on the phone.
4. **On the phone**, open a chat, enable the Fridger connector for that
   conversation (toggle/picker near the message box), and ask things like
   "what's on the shopping list" or "add eggs" — Claude calls the MCP tools
   from there.

**To verify before finalizing the auth design in §2:** exactly how Claude's
custom-connector flow wants the credential. Some custom-connector setups
take a bearer token or custom header directly; others push toward a full
OAuth handshake. If it turns out to require OAuth, that's more work than
§2's token model assumes — check Anthropic's current custom-connector UI
early, before the rest of §2/§3 is built around the token assumption.

---

## 8. Non-goals for v1

- No OAuth / public connector-directory listing — this is a private
  household tool, not a published integration.
- No write access beyond the tools listed above (no deleting items, no
  editing household preferences/settings via the LLM) — keep the blast
  radius of a leaked or misused token small.
- No new ingredient/unit logic introduced for the LLM's benefit — the
  `details` free-text field and existing name normalization
  (see `CLAUDE.md`) are reused as-is, not redesigned for this feature.
