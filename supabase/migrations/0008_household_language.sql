-- Household-level UI/LLM language. Per household (not per user) — both
-- members see the app and get suggestions in the same language.

alter table households
  add column language text not null default 'en' check (language in ('en', 'he'));
