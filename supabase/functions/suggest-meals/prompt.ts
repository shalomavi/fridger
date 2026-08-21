// Every prompt string for this feature lives in this one file — see CLAUDE.md.
// The household's pantry contents are the only user data sent; no names,
// emails, or user ids ever go into the prompt.

export const SYSTEM_INSTRUCTION = `You suggest simple home-cook meals based on what's in someone's pantry.
Reply only with meals that are realistic to cook with mostly what's listed.
It's fine to suggest 1-2 small extra ingredients that aren't listed, but call them out.
Keep steps short and practical — a few sentences, not a full recipe. The pantry may include
Hebrew and English ingredient names in the same list; that's expected, treat them as one list.`

export function buildPrompt(pantryNames: string[], recentMealNames: string[]): string {
  const pantryList = pantryNames.length > 0 ? pantryNames.join(', ') : '(nothing logged yet)'

  const avoidLine =
    recentMealNames.length > 0
      ? `\n\nDon't repeat these recently suggested meals: ${recentMealNames.join(', ')}.`
      : ''

  return `Pantry contents: ${pantryList}${avoidLine}

Suggest 3 different meals. For each one, give:
- name: the meal's name
- uses: pantry ingredients (from the list above) it uses — use the exact spelling from the list
- missing: any extra ingredients needed that aren't in the pantry (can be empty)
- steps: 2-4 short steps to make it`
}

/** Shown when the LLM call fails or returns something that doesn't parse — fail closed,
 * not a hand-authored recipe engine. See the plan, §5. */
export const FALLBACK_MEALS = [
  {
    name: 'Pasta aglio e olio',
    uses: [] as string[],
    missing: ['pasta', 'olive oil', 'garlic'],
    steps: [
      'Boil pasta until al dente.',
      'Gently fry sliced garlic in olive oil until golden.',
      'Toss the pasta through the garlic oil, season, and serve.',
    ],
  },
  {
    name: 'Simple omelette',
    uses: [] as string[],
    missing: ['eggs', 'salt', 'oil or butter'],
    steps: ['Beat eggs with a pinch of salt.', 'Cook in a hot pan with oil or butter, folding once set.'],
  },
  {
    name: 'Grilled cheese sandwich',
    uses: [] as string[],
    missing: ['bread', 'cheese', 'butter'],
    steps: ['Butter two slices of bread.', 'Add cheese between them.', 'Grill both sides until golden and melted.'],
  },
]
