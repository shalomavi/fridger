-- Slice 5: household preferences (allergies, dislikes, kosher/vegetarian,
-- "we don't own an oven"...) fed into the LLM prompt. pantry_items.expires_at
-- already exists from slice 2 (0005) — this migration only adds preferences.

alter table households add column preferences text;
