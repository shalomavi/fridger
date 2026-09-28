-- Recipes tab (slice A): saved meal suggestions, plus (later slices)
-- recipes imported from pasted text, a picture, or a website link. All
-- sources land in this one table — see CLAUDE.md's plan doc.
--
-- Unlike meal_suggestions, this is a plain member-owned table: the client
-- writes to it directly (no elevated Edge Function path needed for a save/
-- delete), same as shopping_items/pantry_items.

create table recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  ingredients jsonb not null,
  steps jsonb not null,
  source text not null check (source in ('suggestion', 'text', 'image', 'url')),
  source_url text,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index recipes_household_created_idx on recipes (household_id, created_at desc);

alter table recipes enable row level security;

create policy "member can read household recipes"
  on recipes for select
  using (is_household_member(household_id));

create policy "member can add to household recipes"
  on recipes for insert
  with check (is_household_member(household_id));

create policy "member can delete from household recipes"
  on recipes for delete
  using (is_household_member(household_id));

-- recipe_parses is a per-household daily-limit log for the parse-recipe
-- Edge Function (slice B) — same shape/purpose as meal_suggestions' own
-- rate-limit check in suggest-meals/index.ts. Only that function writes
-- here (service_role, bypasses RLS); nothing to read as a member, so no
-- select policy either.
create table recipe_parses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index recipe_parses_household_created_idx on recipe_parses (household_id, created_at desc);

alter table recipe_parses enable row level security;
