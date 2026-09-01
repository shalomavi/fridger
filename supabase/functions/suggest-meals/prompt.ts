// Every prompt string for this feature lives in this one file — see CLAUDE.md.
// The household's pantry contents are the only user data sent; no names,
// emails, or user ids ever go into the prompt.

import type { Language } from './schema.ts'

const LANGUAGE_NAME: Record<Language, string> = { en: 'English', he: 'Hebrew' }

export const SYSTEM_INSTRUCTION = `You suggest simple weeknight home-cook meals for a 2-person household, based on
what's in their shared pantry.
Reply only with meals realistic to cook in about 30 minutes with basic kitchen equipment, using mostly what's listed.
It's fine to suggest 1-2 small extra ingredients that aren't listed, but call them out as missing.
Prefer meals that use more of the listed pantry over ones that use only one or two items and leave the rest as
missing — reducing pantry waste is the point of this feature.
Make the 3 suggested meals genuinely different from each other — vary the main ingredient, cuisine, or dish type,
not just the seasoning on the same base dish.
Keep steps short and practical — a few sentences, not a full recipe. The pantry may include
Hebrew and English ingredient names in the same list; that's expected, treat them as one list.`

export function buildPrompt(
  pantryNames: string[],
  recentMealNames: string[],
  lang: Language,
  preferences: string | null,
  expiringSoonNames: string[],
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

  const preferencesLine = preferences?.trim()
    ? `\n\nHousehold preferences and restrictions — follow these strictly (e.g. allergies), even if that means ` +
      `ignoring an expiring-soon item above: ${preferences.trim()}`
    : ''

  return `Pantry contents: ${pantryList}${expiringLine}${preferencesLine}${avoidLine}

Suggest 3 different meals, with portions sized for 2 people. Except for "uses" (see below), write everything —
name, missing, steps — in ${LANGUAGE_NAME[lang]}.

For each meal, give:
- name: the meal's name
- uses: pantry ingredients it uses — copy these EXACTLY as spelled in the pantry list above, in their original
  language, do not translate or rewrite them, even though the rest of your answer is in ${LANGUAGE_NAME[lang]}
- missing: any extra ingredients needed that aren't in the pantry (can be empty)
- steps: 2-4 short steps to make it, including rough quantities sized for 2 people`
}

/** Shown when the LLM call fails or returns something that doesn't parse — fail closed,
 * not a hand-authored recipe engine. See the plan, §5. */
export const FALLBACK_MEALS: Record<
  Language,
  { name: string; uses: string[]; missing: string[]; steps: string[] }[]
> = {
  en: [
    {
      name: 'Pasta aglio e olio',
      uses: [],
      missing: ['pasta', 'olive oil', 'garlic'],
      steps: [
        'Boil pasta until al dente.',
        'Gently fry sliced garlic in olive oil until golden.',
        'Toss the pasta through the garlic oil, season, and serve.',
      ],
    },
    {
      name: 'Simple omelette',
      uses: [],
      missing: ['eggs', 'salt', 'oil or butter'],
      steps: [
        'Beat eggs with a pinch of salt.',
        'Cook in a hot pan with oil or butter, folding once set.',
      ],
    },
    {
      name: 'Grilled cheese sandwich',
      uses: [],
      missing: ['bread', 'cheese', 'butter'],
      steps: [
        'Butter two slices of bread.',
        'Add cheese between them.',
        'Grill both sides until golden and melted.',
      ],
    },
  ],
  he: [
    {
      name: 'פסטה בשמן זית ושום',
      uses: [],
      missing: ['פסטה', 'שמן זית', 'שום'],
      steps: ['מבשלים פסטה עד שהיא אל דנטה.', 'מטגנים קלות שום פרוס בשמן זית עד להזהבה.', 'מערבבים את הפסטה עם השום והשמן, מתבלים ומגישים.'],
    },
    {
      name: 'חביתה פשוטה',
      uses: [],
      missing: ['ביצים', 'מלח', 'שמן או חמאה'],
      steps: ['טורפים ביצים עם קורט מלח.', 'מבשלים במחבת חמה עם שמן או חמאה, מקפלים כשמוצק.'],
    },
    {
      name: 'טוסט גבינה',
      uses: [],
      missing: ['לחם', 'גבינה', 'חמאה'],
      steps: ['מורחים חמאה על שתי פרוסות לחם.', 'מוסיפים גבינה ביניהן.', 'מטגנים משני הצדדים עד להזהבה והמסה.'],
    },
  ],
}
