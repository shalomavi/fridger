import type { Language } from './schema.ts'

/**
 * Shown when the LLM call fails or returns something that doesn't parse —
 * fail closed, not a hand-authored recipe engine. See the plan, §5. Not
 * prompt text (nothing here is ever sent to the LLM), so it lives outside
 * prompt.ts despite CLAUDE.md's "every LLM prompt string lives in
 * prompt.ts" rule — that rule is about text sent to the model.
 */
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
