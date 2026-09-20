-- MCP connector: household-scoped bearer tokens for connecting an LLM app
-- (Claude, via a static_headers custom connector) to this household's data
-- through supabase/functions/mcp. See mcp-connector-plan.md.
--
-- token_hash is a SHA-256 hash computed in the Edge Function (Deno's
-- crypto.subtle.digest) — the raw token is never stored, and is shown to
-- the user exactly once, at creation. The select policy below still grants
-- read access to token_hash at the RLS layer (RLS can't hide individual
-- columns), so every client-side query against this table MUST list
-- columns explicitly (id, label, created_at, last_used_at, revoked_at) and
-- never `select('*')` — see McpTokenSettings.tsx / mcpTokens.ts.

create table mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  token_hash text not null unique,
  label text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

alter table mcp_tokens enable row level security;

create policy "member can read household mcp tokens"
  on mcp_tokens for select
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "member can create household mcp tokens"
  on mcp_tokens for insert
  with check (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

-- The only client-side mutation this app performs is a revoke button
-- setting revoked_at; RLS can't restrict which columns an update touches,
-- so this policy (like shopping_items' update policy) trusts the client
-- code, not the database, to only ever set that one column.
create policy "member can revoke household mcp tokens"
  on mcp_tokens for update
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );
