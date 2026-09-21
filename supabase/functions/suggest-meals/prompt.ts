// Every prompt string for this feature lives in this one file — see CLAUDE.md.
// The household's pantry contents are the only user data sent; no names,
// emails, or user ids ever go into the prompt.

import { CATEGORIES, type Language, type MealType, type SuggestionMode } from './schema.ts'

const LANGUAGE_NAME: Record<Language, string> = { en: 'English', he: 'Hebrew' }

// Soft style nudges — one line per type, phrased as "favor" rather than a
// hard rule, so several selected together nudge the result instead of
// fighting each other outright. Selected types join into one line below.
const STYLE_INSTRUCTIONS = {
  healthy: 'lighter, nutrient-dense meals — more vegetables and lean protein, less deep-frying or heavy cream/cheese',
  fast: 'the quickest options — under 20 minutes hands-on, as few steps and dishes as possible',
  trending: 'currently popular dishes and flavor combinations, not old-fashioned staples',
  unique: 'less common, more adventurous combinations rather than the obvious default dish',
  budget: 'cheap, few-ingredient meals that stretch the pantry rather than requiring extra purchases',
  comfort: 'hearty, warming, familiar comfort food',
  dessert: 'sweet desserts rather than savory meals',
} as const

// Hard dietary constraints, unlike the style nudges above — every meal must
// comply, not just lean that way. dairy/meaty specifically exclude each
// other's ingredient (kosher-style meat/dairy separation), not just favor
// one over the other. pregnancy is a food-safety constraint, not a style —
// it excludes specific risks rather than a food group.
const DIET_INSTRUCTIONS = {
  dairy: 'dairy-based meals only — no meat, poultry, or fish (kosher-style meat/dairy separation)',
  meaty: 'meat-based meals only — no dairy products (kosher-style meat/dairy separation)',
  vegan: 'fully vegan — no meat, poultry, fish, dairy, eggs, or any other animal product',
  vegetarian: 'vegetarian — no meat, poultry, or fish (dairy and eggs are fine)',
  pregnancy:
    'pregnancy-safe — no raw or undercooked meat, fish, shellfish, or eggs; no unpasteurized dairy or juice; ' +
    'no high-mercury fish (e.g. swordfish, shark, king mackerel); no unheated deli/cured meats; no alcohol; ' +
    'no raw sprouts; keep caffeine to a minimum',
} as const

type StyleType = keyof typeof STYLE_INSTRUCTIONS
type DietType = keyof typeof DIET_INSTRUCTIONS

function isStyleType(type: MealType): type is StyleType {
  return type in STYLE_INSTRUCTIONS
}

function isDietType(type: MealType): type is DietType {
  return type in DIET_INSTRUCTIONS
}

// One system instruction per suggestion mode — 'pantry' anchors on what's on
// hand and caps how much can be missing; 'any' drops that constraint so the
// household can browse meals regardless of pantry contents, buying most or
// all of what a meal needs. Both still report pantry matches under "uses"
// and everything else under "missing" — see buildPrompt below — so the same
// downstream schema and "add missing to shopping list" flow serve either.
const SYSTEM_INSTRUCTION_BY_MODE: Record<SuggestionMode, string> = {
  pantry: `You suggest simple weeknight home-cook meals for a 2-person household, based on
what's in their shared pantry.
Reply only with meals realistic to cook with basic kitchen equipment, using mostly what's listed.
It's fine to suggest 1-2 small extra ingredients that aren't listed, but call them out as missing.
Prefer meals that use more of the listed pantry over ones that use only one or two items and leave the rest as
missing — reducing pantry waste is the point of this mode.
Make the 3 suggested meals genuinely different from each other — vary the main ingredient, cuisine, or dish type,
not just the seasoning on the same base dish.
Keep steps short and practical — a few sentences, not a full recipe. The pantry may include
Hebrew and English ingredient names in the same list; that's expected, treat them as one list.`,
  any: `You suggest simple weeknight home-cook meals for a 2-person household. Choose whatever meals genuinely fit
the household's preferences and meal-type requests below — do not limit yourself to what's in their pantry, and
do not favor a meal just because it happens to use more of it. It's fine, and expected, for most or all of a
meal's ingredients to need buying.
Reply only with meals realistic to cook with basic kitchen equipment.
Still check the pantry list below: if an ingredient a meal needs matches something already there, report it under
"uses" instead of "missing" so the household isn't told to buy something they already have.
Make the 3 suggested meals genuinely different from each other — vary the main ingredient, cuisine, or dish type,
not just the seasoning on the same base dish.
Keep steps short and practical — a few sentences, not a full recipe. The pantry may include
Hebrew and English ingredient names in the same list; that's expected, treat them as one list.`,
}

export function systemInstructionFor(mode: SuggestionMode): string {
  return SYSTEM_INSTRUCTION_BY_MODE[mode]
}

export function buildPrompt(
  pantryNames: string[],
  recentMealNames: string[],
  lang: Language,
  preferences: string | null,
  expiringSoonNames: string[],
  mealTypes: MealType[],
  mode: SuggestionMode,
): string {
  const pantryList = pantryNames.length > 0 ? pantryNames.join(', ') : '(nothing logged yet)'

  const avoidLine =
    recentMealNames.length > 0
      ? `\n\nDon't repeat these recently suggested meals: ${recentMealNames.join(', ')}.`
      : ''

  const expiringLine =
    expiringSoonNames.length > 0
      ? `\n\nThese are expiring soon — prefer meals that use them: ${expiringSoonNames.join(', ')}.`
      : ''

  const styleSelected = mealTypes.filter(isStyleType)
  const mealTypesLine =
    styleSelected.length > 0
      ? `\n\nFavor: ${styleSelected.map((type) => STYLE_INSTRUCTIONS[type]).join('; ')}.`
      : ''

  const dietSelected = mealTypes.filter(isDietType)
  const dietLine =
    dietSelected.length > 0
      ? `\n\nDietary requirement — every meal must comply, no exceptions: ${dietSelected
          .map((type) => DIET_INSTRUCTIONS[type])
          .join('; ')}.`
      : ''

  const preferencesLine = preferences?.trim()
    ? `\n\nHousehold preferences and restrictions — follow these strictly (e.g. allergies), even if that means ` +
      `ignoring an expiring-soon item, meal-type style, or dietary requirement above: ${preferences.trim()}`
    : ''

  const unitsNote =
    lang === 'he'
      ? ' Write quantities in the steps using Hebrew unit words (e.g. גרם, ק"ג, מ"ל, ליטר, יחידה/יחידות), not ' +
        'English abbreviations like "g" or "ml" — this applies only to the steps text, not the "uses" unit field ' +
        'below, which must stay one of the fixed English values.'
      : ''

  return `Pantry contents: ${pantryList}${expiringLine}${mealTypesLine}${dietLine}${preferencesLine}${avoidLine}

Suggest 3 different meals, with portions sized for 2 people. Except for "uses" (see below), write everything —
name, missing, steps — in ${LANGUAGE_NAME[lang]}.

For each meal, give:
- name: the meal's name
- uses: pantry ingredients it uses. For each, give:
  - name: copy this EXACTLY as spelled in the pantry list above, in its original language, do not translate or
    rewrite it, even though the rest of your answer is in ${LANGUAGE_NAME[lang]}
  - quantity: a number, how much of that ingredient the recipe uses
  - unit: one of "count" (a whole item with no natural unit, e.g. an egg or an onion), "g", "kg", "ml", or "l" —
    pick whichever naturally fits (e.g. quantity 500, unit "g" for half a kilo of cheese; quantity 2, unit
    "count" for two eggs)
- missing: ingredients needed that aren't in the pantry${mode === 'pantry' ? ' (can be empty)' : ' (expect most or all of a meal\'s ingredients here — that\'s normal for this mode)'}. For each, give:
  - name: the ingredient's name, in ${LANGUAGE_NAME[lang]}
  - quantity: a number, how much of it the recipe needs
  - unit: one of "count", "g", "kg", "ml", or "l" — same rule as "uses"' unit above
  - category: the single best fit from this fixed list — ${CATEGORIES.join(', ')} — for where it belongs on a
    grocery shopping list (e.g. cheese is "dairy", a bell pepper is "produce", raw chicken is "meat", rice or
    canned goods are "pantry")
- steps: 3-5 short steps to make it, including rough quantities sized for 2 people${unitsNote}`
}
