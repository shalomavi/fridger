-- Fixes household creation: insert(...).select() reads the row back in the
-- same call, and RLS enforces the SELECT policy on that returned row too.
-- The existing "member can read own household" policy requires membership,
-- which doesn't exist yet at that instant (it's inserted right after).
-- Track who created it and let them read it before they're a formal member.

alter table households add column created_by uuid references auth.users (id);

create policy "creator can read household they created"
  on households for select
  using (created_by = auth.uid());
