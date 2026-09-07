-- Manual category tag per item (dairy, produce, etc.) — see src/shared/categories.ts
-- for the canonical list, which must stay in sync with this check constraint.
-- Nullable: existing rows, and anything the user chooses not to tag, stay uncategorized.

alter table shopping_items add column category text
  check (category in (
    'dairy', 'produce', 'meat', 'bakery', 'pantry', 'frozen',
    'beverages', 'snacks', 'household', 'other'
  ));

alter table pantry_items add column category text
  check (category in (
    'dairy', 'produce', 'meat', 'bakery', 'pantry', 'frozen',
    'beverages', 'snacks', 'household', 'other'
  ));
