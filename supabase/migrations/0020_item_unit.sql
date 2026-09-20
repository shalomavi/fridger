-- Adds a unit alongside quantity, and widens quantity to numeric so
-- fractional amounts (0.5kg) are representable. Unit is a small fixed set
-- grouped by kind (weight: g/kg, volume: ml/l, count: unitless) so merges
-- and "cooked this" reduction can convert within a group instead of doing
-- raw arithmetic across mismatched units — see domain/units.ts.

alter table shopping_items alter column quantity type numeric using quantity::numeric;
alter table shopping_items add column unit text not null default 'count'
  check (unit in ('count', 'g', 'kg', 'ml', 'l'));

alter table pantry_items alter column quantity type numeric using quantity::numeric;
alter table pantry_items add column unit text not null default 'count'
  check (unit in ('count', 'g', 'kg', 'ml', 'l'));
