-- Multi-select meal-type preference fed into the LLM prompt (healthy, fast,
-- trending, unique, budget, comfort, dairy, meaty) — see
-- src/shared/mealTypes.ts for the canonical list, which must stay in sync
-- with this check constraint. Empty array (the default) means no preference.

alter table households add column meal_types text[] not null default '{}'
  check (meal_types <@ array[
    'healthy', 'fast', 'trending', 'unique', 'budget', 'comfort', 'dairy', 'meaty'
  ]);
