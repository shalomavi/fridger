-- Adds 'hygiene' to the category list (src/shared/categories.ts) — the
-- check constraints from 0012 must be dropped and recreated to allow it;
-- postgres has no "add value to existing check" shortcut.

alter table shopping_items drop constraint shopping_items_category_check;
alter table shopping_items add constraint shopping_items_category_check
  check (category in (
    'dairy', 'produce', 'meat', 'bakery', 'pantry', 'frozen',
    'beverages', 'snacks', 'household', 'hygiene', 'other'
  ));

alter table pantry_items drop constraint pantry_items_category_check;
alter table pantry_items add constraint pantry_items_category_check
  check (category in (
    'dairy', 'produce', 'meat', 'bakery', 'pantry', 'frozen',
    'beverages', 'snacks', 'household', 'hygiene', 'other'
  ));
