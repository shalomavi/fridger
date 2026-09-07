-- Per-household display order for category sections in the shopping list
-- and pantry (see src/shared/categories.ts). NULL means "use that file's
-- default order" — nothing to backfill.

alter table households add column category_order text[];
