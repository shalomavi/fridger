-- households never had an UPDATE policy — only insert and two select
-- policies exist (0001, 0003). An UPDATE with no matching RLS policy isn't
-- an error: Postgres just matches zero rows, and Postgrest returns 204 as
-- if it worked. The language toggle's PATCH was doing exactly that.

create policy "member can update own household"
  on households for update
  using (is_household_member(id));
