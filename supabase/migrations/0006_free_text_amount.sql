-- Replaces the split quantity(numeric)/unit(text) columns with one free-text
-- amount column. Real grocery entries ("a bag", "1 dozen", "2kg") don't
-- decompose cleanly into a number + a fixed unit, and a picker for that is
-- exactly the friction the plan warned against. No rows exist with real
-- quantity/unit data yet, so this is a straight replace, not a migration of
-- existing values.

alter table shopping_items drop column quantity;
alter table shopping_items drop column unit;
alter table shopping_items add column amount text;

alter table pantry_items drop column quantity;
alter table pantry_items drop column unit;
alter table pantry_items add column amount text;
