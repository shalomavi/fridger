import type { Category, Language, Unit } from './schema.ts'

type MissingIngredient = { name: string; quantity: number; unit: Unit; category: Category }

/**
 * Shown when the LLM call fails or returns something that doesn't parse —
 * fail closed, not a hand-authored recipe engine. See the plan, §5. Not
 * prompt text (nothing here is ever sent to the LLM), so it lives outside
 * prompt.ts despite CLAUDE.md's "every LLM prompt string lives in
 * prompt.ts" rule — that rule is about text sent to the model.
 */
export const FALLBACK_MEALS: Record<
  Language,
  { name: string; uses: { name: string; quantity: number; unit: Unit }[]; missing: MissingIngredient[]; steps: string[] }[]
> = {
  en: [
    {
      name: 'Pasta aglio e olio',
      uses: [],
      missing: [
        { name: 'pasta', quantity: 1, unit: 'count', category: 'pantry' },
        { name: 'olive oil', quantity: 1, unit: 'count', category: 'pantry' },
        { name: 'garlic', quantity: 1, unit: 'count', category: 'produce' },
      ],
      steps: [
        'Boil pasta until al dente.',
        'Gently fry sliced garlic in olive oil until golden.',
        'Toss the pasta through the garlic oil, season, and serve.',
      ],
    },
    {
      name: 'Simple omelette',
      uses: [],
      missing: [
        { name: 'eggs', quantity: 3, unit: 'count', category: 'dairy' },
        { name: 'salt', quantity: 1, unit: 'count', category: 'pantry' },
        { name: 'oil or butter', quantity: 1, unit: 'count', category: 'pantry' },
      ],
      steps: [
        'Beat eggs with a pinch of salt.',
        'Cook in a hot pan with oil or butter, folding once set.',
      ],
    },
    {
      name: 'Grilled cheese sandwich',
      uses: [],
      missing: [
        { name: 'bread', quantity: 1, unit: 'count', category: 'bakery' },
        { name: 'cheese', quantity: 1, unit: 'count', category: 'dairy' },
        { name: 'butter', quantity: 1, unit: 'count', category: 'dairy' },
      ],
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
      missing: [
        { name: 'פסטה', quantity: 1, unit: 'count', category: 'pantry' },
        { name: 'שמן זית', quantity: 1, unit: 'count', category: 'pantry' },
        { name: 'שום', quantity: 1, unit: 'count', category: 'produce' },
      ],
      steps: ['מבשלים פסטה עד שהיא אל דנטה.', 'מטגנים קלות שום פרוס בשמן זית עד להזהבה.', 'מערבבים את הפסטה עם השום והשמן, מתבלים ומגישים.'],
    },
    {
      name: 'חביתה פשוטה',
      uses: [],
      missing: [
        { name: 'ביצים', quantity: 3, unit: 'count', category: 'dairy' },
        { name: 'מלח', quantity: 1, unit: 'count', category: 'pantry' },
        { name: 'שמן או חמאה', quantity: 1, unit: 'count', category: 'pantry' },
      ],
      steps: ['טורפים ביצים עם קורט מלח.', 'מבשלים במחבת חמה עם שמן או חמאה, מקפלים כשמוצק.'],
    },
    {
      name: 'טוסט גבינה',
      uses: [],
      missing: [
        { name: 'לחם', quantity: 1, unit: 'count', category: 'bakery' },
        { name: 'גבינה', quantity: 1, unit: 'count', category: 'dairy' },
        { name: 'חמאה', quantity: 1, unit: 'count', category: 'dairy' },
      ],
      steps: ['מורחים חמאה על שתי פרוסות לחם.', 'מוסיפים גבינה ביניהן.', 'מטגנים משני הצדדים עד להזהבה והמסה.'],
    },
  ],
}
