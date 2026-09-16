import { isMealType, type Language, type MealType } from './schema.ts'

export type RequestBody = {
  householdId: string
  regenerate: boolean
  lang: Language
  preferences: string | null
  mealTypes: MealType[]
}

/** Parses and validates the POST body — throws (caller returns 400) if
 * householdId is missing; every other field falls back to a safe default
 * rather than failing the request over a malformed optional field. */
export async function parseRequestBody(req: Request): Promise<RequestBody> {
  const body = await req.json()
  if (!body.householdId) throw new Error('missing householdId')

  return {
    householdId: body.householdId,
    regenerate: Boolean(body.regenerate),
    lang: body.lang === 'he' || body.lang === 'en' ? body.lang : 'en',
    preferences: typeof body.preferences === 'string' ? body.preferences : null,
    mealTypes: Array.isArray(body.mealTypes) ? body.mealTypes.filter(isMealType) : [],
  }
}
