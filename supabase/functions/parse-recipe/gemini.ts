import { SYSTEM_INSTRUCTION, buildPrompt } from './prompt.ts'
import type { Language } from './schema.ts'

const MODEL = 'gemini-2.5-flash'

// isRecipe is the only always-required field — when it's false the rest are
// simply omitted by the model, so they stay optional here (see schema.ts's
// zod union, which is what actually enforces the two valid shapes).
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    isRecipe: { type: 'boolean' },
    name: { type: 'string' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number' },
          unit: { type: 'string', enum: ['count', 'g', 'kg', 'ml', 'l'] },
          category: {
            type: 'string',
            enum: [
              'dairy',
              'produce',
              'meat',
              'bakery',
              'pantry',
              'frozen',
              'beverages',
              'snacks',
              'household',
              'hygiene',
              'other',
            ],
          },
        },
        required: ['name', 'quantity', 'unit', 'category'],
      },
    },
    steps: { type: 'array', items: { type: 'string' } },
  },
  required: ['isRecipe'],
}

/** Same structured-output approach as suggest-meals/gemini.ts — constrains
 * the model to valid JSON instead of parsing prose. Throws on any network/
 * API failure or non-2xx; the caller (index.ts) decides what to do with
 * that (there's no fallback engine here, unlike suggest-meals). */
export async function callGemini(apiKey: string, rawText: string, lang: Language): Promise<unknown> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ parts: [{ text: buildPrompt(rawText, lang) }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`)
  }

  const body = await res.json()
  const text = body.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text !== 'string') {
    throw new Error('Gemini response had no text part')
  }
  return JSON.parse(text)
}
