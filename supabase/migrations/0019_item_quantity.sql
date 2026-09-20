-- Adds a plain integer quantity count back to shopping/pantry items,
-- separate from the free-text `details` column. This is not the
-- quantity+unit split that 0006 removed — there's still no unit, no
-- taxonomy, no picker; `quantity` is just "how many", and `details` still
-- carries everything else ("2kg", "organic"). See CLAUDE.md.

alter table shopping_items add column quantity integer not null default 1 check (quantity > 0);
alter table pantry_items add column quantity integer not null default 1 check (quantity > 0);
