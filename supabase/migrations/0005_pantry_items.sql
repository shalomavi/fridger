-- Slice 2: the pantry. shopping_items -> pantry_items is a transition, not a
-- move — the shopping row stays (marked purchased) for history; a new
-- pantry row is created. status/consumed_at exist now so slice 3 (consume)
-- has somewhere to write, per the plan's §3 correction.

create table pantry_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  status text not null default 'available' check (status in ('available', 'consumed')),
  added_at timestamptz not null default now(),
  consumed_at timestamptz,
  expires_at timestamptz,
  source_item_id uuid references shopping_items (id) on delete set null
);

alter table pantry_items enable row level security;

create policy "member can read household pantry"
  on pantry_items for select
  using (is_household_member(household_id));

create policy "member can add to household pantry"
  on pantry_items for insert
  with check (is_household_member(household_id));

create policy "member can update household pantry"
  on pantry_items for update
  using (is_household_member(household_id));

create policy "member can delete from household pantry"
  on pantry_items for delete
  using (is_household_member(household_id));
