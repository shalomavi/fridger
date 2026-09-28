import type { Language } from './schema.ts'

// 'input.type' distinguishes the import source. 'url' (link import) lands
// in a later slice, adding its own field here without disturbing this
// shape.
export type RequestBody = {
  householdId: string
  lang: Language
  input: { type: 'text'; text: string } | { type: 'image'; imageBase64: string; mimeType: string }
}

// Base64 is ~4/3 the size of the decoded bytes, so this caps the decoded
// image at roughly the 4 MB the plan calls for.
const MAX_IMAGE_BASE64_LENGTH = Math.ceil((4 * 1024 * 1024 * 4) / 3)

/** Parses and validates the POST body — throws (caller returns 400) for a
 * missing householdId, an oversized or missing image, or missing/blank
 * pasted text; lang falls back to a safe default rather than failing the
 * request over it. */
export async function parseRequestBody(req: Request): Promise<RequestBody> {
  const body = await req.json()
  if (!body.householdId) throw new Error('missing householdId')
  const lang = body.lang === 'he' || body.lang === 'en' ? body.lang : 'en'
  const householdId = body.householdId

  if (body.input?.type === 'image') {
    const imageBase64 = typeof body.input.imageBase64 === 'string' ? body.input.imageBase64 : ''
    if (!imageBase64) throw new Error('missing input.imageBase64')
    if (imageBase64.length > MAX_IMAGE_BASE64_LENGTH) throw new Error('image too large')
    const mimeType = typeof body.input.mimeType === 'string' ? body.input.mimeType : 'image/jpeg'
    return { householdId, lang, input: { type: 'image', imageBase64, mimeType } }
  }

  const text = typeof body.input?.text === 'string' ? body.input.text.trim() : ''
  if (!text) throw new Error('missing input.text')

  return { householdId, lang, input: { type: 'text', text } }
}
