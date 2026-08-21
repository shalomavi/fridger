-- Slice 1: the shared shopping list, plus the invite policies needed to get
-- a second user into the same household (households/household_members/invites
-- tables themselves came from 0001).

create table shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  status text not null default 'pending' check (status in ('pending', 'purchased')),
  added_by uuid references auth.users (id),
  purchased_at timestamptz,
  created_at timestamptz not null default now()
);

alter table shopping_items enable row level security;

create policy "member can read household shopping list"
  on shopping_items for select
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "member can add to household shopping list"
  on shopping_items for insert
  with check (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "member can update household shopping list"
  on shopping_items for update
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

-- Invites: a member can create one for their own household. Anyone
-- authenticated can look one up by code (they don't have a household yet,
-- so the household-membership check that guards every other table doesn't
-- apply here) and can claim it once, atomically, via the update below.

create policy "member can create an invite for their household"
  on invites for insert
  with check (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "authenticated can look up an invite by code"
  on invites for select
  using (auth.uid() is not null);

create policy "authenticated can claim an unused invite"
  on invites for update
  using (used_by is null)
  with check (used_by = auth.uid());
