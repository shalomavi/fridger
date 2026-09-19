-- Expands the meal_types check constraint from 0016 to add 'dessert' — see
-- src/shared/mealTypes.ts for the canonical list.

alter table households drop constraint households_meal_types_check;

alter table households add constraint households_meal_types_check
  check (meal_types <@ array[
    'healthy', 'fast', 'trending', 'unique', 'budget', 'comfort', 'dessert',
    'dairy', 'meaty', 'vegan', 'vegetarian'
  ]);
