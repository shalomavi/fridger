import { SYSTEM_INSTRUCTION, buildTextPrompt, buildImagePrompt, buildUrlPrompt } from './prompt.ts'
import type { Language } from './schema.ts'

const MODEL = 'gemini-2.5-flash'

// Gemini's responseSchema can't express "these fields are required only
// when isRecipe is true" (no conditional/if-then support), so every field
// is marked required here to stop the model from silently omitting one
// (seen in practice: isRecipe: true with no ingredients array at all, which
// then failed schema.ts's zod union). When isRecipe is false the model just
// fills the rest with an empty name/array — schema.ts's union is what
// actually enforces the two valid shapes; this only pins down JSON keys.
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
  required: ['isRecipe', 'name', 'ingredients', 'steps'],
}

// index.ts scrapes url inputs itself (see scrape.ts) and passes the result
// here as scrapedText, rather than this file doing its own fetch — keeps
// network access to one place. This is deliberately its own type rather
// than RequestBody['input'] directly: gemini.ts never sees a raw url, only
// already-scraped text.
export type GeminiInput =
  | { type: 'text'; text: string }
  | { type: 'image'; imageBase64: string; mimeType: string }
  | { type: 'scraped-url'; scrapedText: string }

/** Same structured-output approach as suggest-meals/gemini.ts — constrains
 * the model to valid JSON instead of parsing prose. Throws on any network/
 * API failure or non-2xx; the caller (index.ts) decides what to do with
 * that (there's no fallback engine here, unlike suggest-meals). */
export async function callGemini(apiKey: string, input: GeminiInput, lang: Language): Promise<unknown> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

  const parts =
    input.type === 'image'
      ? [{ text: buildImagePrompt(lang) }, { inlineData: { mimeType: input.mimeType, data: input.imageBase64 } }]
      : input.type === 'scraped-url'
        ? [{ text: buildUrlPrompt(input.scrapedText, lang) }]
        : [{ text: buildTextPrompt(input.text, lang) }]

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ parts }],
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
