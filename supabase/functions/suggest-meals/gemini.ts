import { SYSTEM_INSTRUCTION, buildPrompt } from './prompt.ts'

const MODEL = 'gemini-2.5-flash'

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    meals: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          uses: { type: 'array', items: { type: 'string' } },
          missing: { type: 'array', items: { type: 'string' } },
          steps: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'uses', 'missing', 'steps'],
      },
    },
  },
  required: ['meals'],
}

/**
 * Calls Gemini in structured-output mode (responseSchema), so the model is
 * constrained to valid JSON instead of us parsing prose. Throws on any
 * network/API failure or non-2xx — the caller decides what "fail closed"
 * means (see index.ts).
 */
export async function callGemini(
  apiKey: string,
  pantryNames: string[],
  recentMealNames: string[],
): Promise<unknown> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ parts: [{ text: buildPrompt(pantryNames, recentMealNames) }] }],
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
