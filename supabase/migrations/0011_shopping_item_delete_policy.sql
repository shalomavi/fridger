-- Shopping list gets a delete action (mis-added items) — shopping_items only
-- had select/insert/update policies until now, so a delete would be
-- silently blocked by RLS.

create policy "member can delete from household shopping list"
  on shopping_items for delete
  using (is_household_member(household_id));
