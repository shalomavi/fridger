-- Slice 4: LLM meal suggestions, cached by pantry name-set hash.
-- Only the suggest-meals Edge Function writes here (service_role, bypasses
-- RLS) — it does its own membership check before writing. Members can read
-- their own household's history via RLS like everything else.

create table meal_suggestions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  prompt_hash text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index meal_suggestions_household_hash_idx
  on meal_suggestions (household_id, prompt_hash, created_at desc);

alter table meal_suggestions enable row level security;

create policy "member can read household meal suggestions"
  on meal_suggestions for select
  using (is_household_member(household_id));

-- Deliberately no insert/update policy for the anon-key client — writes go
-- through the Edge Function's service_role key only.
