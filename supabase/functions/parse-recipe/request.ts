import type { Language } from './schema.ts'

// 'input.type' distinguishes the import source — only 'text' exists yet
// (slice B); 'image' and 'url' land in later slices, adding their own
// fields here (e.g. `imageBase64`, `url`) without disturbing this shape.
export type RequestBody = {
  householdId: string
  lang: Language
  input: { type: 'text'; text: string }
}

/** Parses and validates the POST body — throws (caller returns 400) for a
 * missing householdId or missing/blank pasted text; lang falls back to a
 * safe default rather than failing the request over it. */
export async function parseRequestBody(req: Request): Promise<RequestBody> {
  const body = await req.json()
  if (!body.householdId) throw new Error('missing householdId')

  const text = typeof body.input?.text === 'string' ? body.input.text.trim() : ''
  if (!text) throw new Error('missing input.text')

  return {
    householdId: body.householdId,
    lang: body.lang === 'he' || body.lang === 'en' ? body.lang : 'en',
    input: { type: 'text', text },
  }
}
