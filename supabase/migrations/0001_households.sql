-- Slice 0: households + membership. Everything else hangs off household_id.
-- RLS is written against auth.uid() and enforced for the anon-key client;
-- the Edge Function (service_role) bypasses it and must check membership itself.

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our household',
  created_at timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table invites (
  code text primary key,
  household_id uuid not null references households (id) on delete cascade,
  expires_at timestamptz not null,
  used_by uuid references auth.users (id)
);

alter table households enable row level security;
alter table household_members enable row level security;
alter table invites enable row level security;

-- A user can see a household only if they're a member of it.
create policy "member can read own household"
  on households for select
  using (
    id in (select household_id from household_members where user_id = auth.uid())
  );

-- Members can see the membership rows of their own household (to list co-members).
create policy "member can read own membership rows"
  on household_members for select
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

-- Joining is via the invites flow (slice 2), not a raw insert from the client.
create policy "user can insert their own membership"
  on household_members for insert
  with check (user_id = auth.uid());

create policy "creator can insert a household"
  on households for insert
  with check (true);
