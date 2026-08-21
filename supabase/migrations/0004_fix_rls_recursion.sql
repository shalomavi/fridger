-- Fixes: "infinite recursion detected in policy for relation household_members".
--
-- Every policy so far checked membership with a subquery against
-- household_members itself:
--   household_id in (select household_id from household_members where user_id = auth.uid())
-- On household_members' own SELECT policy, that subquery re-evaluates the
-- same policy on itself, forever.
--
-- Fix: a SECURITY DEFINER function runs as the function owner (the table
-- owner), and RLS does not apply to a table's owner unless FORCE ROW LEVEL
-- SECURITY is set — so the query inside doesn't re-trigger any policy.
-- Every policy that checked membership now calls this instead of querying
-- household_members directly.

create or replace function is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from household_members
    where household_id = target_household_id and user_id = auth.uid()
  );
$$;

revoke all on function is_household_member(uuid) from public;
grant execute on function is_household_member(uuid) to authenticated;

drop policy "member can read own household" on households;
create policy "member can read own household"
  on households for select
  using (is_household_member(id));

drop policy "member can read own membership rows" on household_members;
create policy "member can read own membership rows"
  on household_members for select
  using (is_household_member(household_id));

drop policy "member can read household shopping list" on shopping_items;
create policy "member can read household shopping list"
  on shopping_items for select
  using (is_household_member(household_id));

drop policy "member can add to household shopping list" on shopping_items;
create policy "member can add to household shopping list"
  on shopping_items for insert
  with check (is_household_member(household_id));

drop policy "member can update household shopping list" on shopping_items;
create policy "member can update household shopping list"
  on shopping_items for update
  using (is_household_member(household_id));

drop policy "member can create an invite for their household" on invites;
create policy "member can create an invite for their household"
  on invites for insert
  with check (is_household_member(household_id));
