-- Expands the meal_types check constraint from 0015 to add 'vegan' and
-- 'vegetarian' — see src/shared/mealTypes.ts for the canonical list.
-- Unnamed check constraints get Postgres's default name
-- "<table>_<column>_check", which is what 0015's untitled constraint on
-- households.meal_types was assigned.

alter table households drop constraint households_meal_types_check;

alter table households add constraint households_meal_types_check
  check (meal_types <@ array[
    'healthy', 'fast', 'trending', 'unique', 'budget', 'comfort', 'dairy', 'meaty',
    'vegan', 'vegetarian'
  ]);
