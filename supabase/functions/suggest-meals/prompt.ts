// Every prompt string for this feature lives in this one file — see CLAUDE.md.
// The household's pantry contents are the only user data sent; no names,
// emails, or user ids ever go into the prompt.

import type { Language } from './schema.ts'

const LANGUAGE_NAME: Record<Language, string> = { en: 'English', he: 'Hebrew' }

export const SYSTEM_INSTRUCTION = `You suggest simple home-cook meals based on what's in someone's pantry.
Reply only with meals that are realistic to cook with mostly what's listed.
It's fine to suggest 1-2 small extra ingredients that aren't listed, but call them out.
Keep steps short and practical — a few sentences, not a full recipe. The pantry may include
Hebrew and English ingredient names in the same list; that's expected, treat them as one list.`

export function buildPrompt(
  pantryNames: string[],
  recentMealNames: string[],
  lang: Language,
): string {
  const pantryList = pantryNames.length > 0 ? pantryNames.join(', ') : '(nothing logged yet)'

  const avoidLine =
    recentMealNames.length > 0
      ? `\n\nDon't repeat these recently suggested meals: ${recentMealNames.join(', ')}.`
      : ''

  return `Pantry contents: ${pantryList}${avoidLine}

Suggest 3 different meals. For each one, give:
- name: the meal's name, written in ${LANGUAGE_NAME[lang]}
- uses: pantry ingredients it uses — copy these EXACTLY as spelled in the pantry list above,
  do not translate or rewrite them, even if the rest of your answer is in a different language
- missing: any extra ingredients needed that aren't in the pantry (can be empty), written in ${LANGUAGE_NAME[lang]}
- steps: 2-4 short steps to make it, written in ${LANGUAGE_NAME[lang]}`
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
