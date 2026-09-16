-- Renames the free-text `amount` column to `details` on both tables, to
-- match app-layer naming. Still a single free-text field, no unit/number
-- split — see CLAUDE.md.

alter table shopping_items rename column amount to details;
alter table pantry_items rename column amount to details;
