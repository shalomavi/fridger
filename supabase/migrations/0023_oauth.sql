-- OAuth 2.1 authorization server for the MCP connector, for clients that
-- can't use a static bearer token (Gemini confirmed this requirement
-- empirically; ChatGPT is expected to need the same — see
-- mcp-connector-plan.md §7b/§7c). Lives alongside the existing mcp_tokens
-- static-token path used by Claude (§2/§7a), which is untouched.
--
-- All three tables are service-role only: RLS is enabled with no policies,
-- so no client-side Supabase call can read or write them at all — only
-- supabase/functions/mcp's admin client (service role, bypasses RLS)
-- touches these, same posture as the rest of that function's elevated
-- access. Household-facing reads/writes go through the mcp function's
-- /oauth/connections routes instead, not direct table access.

create table oauth_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  client_secret_hash text,
  client_name text not null,
  redirect_uris text[] not null,
  created_at timestamptz not null default now()
);

alter table oauth_clients enable row level security;

create table oauth_authorization_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  client_id text not null references oauth_clients (client_id) on delete cascade,
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  redirect_uri text not null,
  code_challenge text not null,
  code_challenge_method text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table oauth_authorization_codes enable row level security;

create table oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references oauth_clients (client_id) on delete cascade,
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  access_token_hash text not null unique,
  access_token_expires_at timestamptz not null,
  refresh_token_hash text not null unique,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table oauth_tokens enable row level security;
