// Every prompt string for this feature lives in this one file — see
// CLAUDE.md. Text (slice B), picture (slice C), and link (slice D) each
// build the same instructions block onto their own source-specific opener.

import { CATEGORIES, type Language } from './schema.ts'

const LANGUAGE_NAME: Record<Language, string> = { en: 'English', he: 'Hebrew' }

export const SYSTEM_INSTRUCTION = `You extract a structured recipe from input a household provided, so it can be
saved to their recipe box and, optionally, turned into a shopping list.
Reply only with what the input actually shows — do not invent ingredients, quantities, or steps it doesn't
mention, and do not pad a short recipe out with extra "suggested" ingredients or steps.
If the input isn't a recipe at all (e.g. it's an unrelated article, an error message, random chat/photo, or too
garbled/incomplete to make out a dish), say so honestly instead of forcing something onto it.`

function buildInstructions(lang: Language): string {
  return `First decide: is this actually a recipe (a dish with ingredients and steps to make it), even if messily
formatted, translated, or missing minor details? If not, reply with isRecipe: false and nothing else.

If it is a recipe, reply with isRecipe: true and:
- name: the dish's name, in ${LANGUAGE_NAME[lang]} (translate if the source is in another language)
- ingredients: every ingredient the recipe lists. For each, give:
  - name: the ingredient's name, in ${LANGUAGE_NAME[lang]}
  - quantity: a number. Convert any other unit (cups, tablespoons, teaspoons, ounces, pounds, etc.) into whichever
    of "count"/"g"/"kg"/"ml"/"l" fits best (e.g. "1 cup flour" → about 120, "g"; "2 tbsp oil" → about 30, "ml").
    For a vague amount like "salt to taste" or "a pinch of pepper", estimate a small reasonable quantity (e.g. 1
    "count" or 2 "g") rather than skipping the ingredient.
  - unit: one of "count", "g", "kg", "ml", or "l" — same rule as quantity above
  - category: the single best fit from this fixed list — ${CATEGORIES.join(', ')} — for where it belongs on a
    grocery shopping list
- steps: the recipe's steps, in ${LANGUAGE_NAME[lang]}, as a short list (rewrite a wall of prose into discrete
  steps if the source isn't already a numbered list; keep the household's original amounts/timings/temperatures)`
}

export function buildTextPrompt(rawText: string, lang: Language): string {
  return `Here is text pasted by the household, which should be a cooking recipe:

"""
${rawText}
"""

${buildInstructions(lang)}`
}

export function buildImagePrompt(lang: Language): string {
  return `Here is a picture the household took, which should show a cooking recipe (e.g. a cookbook page, a
handwritten recipe card, or a recipe shown on a screen). Read whatever text is visible in it.

${buildInstructions(lang)}`
}

export function buildUrlPrompt(scrapedText: string, lang: Language): string {
  return `Here is content fetched from a web page the household linked to, which should be a cooking recipe. It may
be raw structured recipe data (JSON) or plain text extracted from the page — either way, read through any
surrounding site clutter (navigation, ads, comments, related-recipe links) to find the actual recipe.

"""
${scrapedText}
"""

${buildInstructions(lang)}`
}
