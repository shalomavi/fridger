-- Expands the meal_types check constraint from 0018 to add 'pregnancy' —
-- see src/shared/mealTypes.ts for the canonical list.

alter table households drop constraint households_meal_types_check;

alter table households add constraint households_meal_types_check
  check (meal_types <@ array[
    'healthy', 'fast', 'trending', 'unique', 'budget', 'comfort', 'dessert',
    'dairy', 'meaty', 'vegan', 'vegetarian', 'pregnancy'
  ]);
