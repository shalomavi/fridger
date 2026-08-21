// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import '@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from '@supabase/supabase-js'
import { callGemini } from './gemini.ts'
import { FALLBACK_MEALS } from './prompt.ts'
import { SuggestionsSchema, pantryHash, isExpiringSoon, type Language } from './schema.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!

const DAILY_LIMIT = 20
const PANTRY_CAP = 60

// The browser calls this cross-origin (the app's own domain -> the
// functions.supabase.co domain), so every response — including the
// preflight OPTIONS and every error path below — needs these headers, not
// just the success path.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  let householdId: string
  let regenerate = false
  let lang: Language = 'en'
  let preferences: string | null = null
  try {
    const body = await req.json()
    householdId = body.householdId
    regenerate = Boolean(body.regenerate)
    if (body.lang === 'he' || body.lang === 'en') lang = body.lang
    if (typeof body.preferences === 'string') preferences = body.preferences
    if (!householdId) throw new Error('missing householdId')
  } catch {
    return json({ error: 'Expected JSON body with householdId' }, 400)
  }

  // Identify the caller from their own JWT — this is a real auth check,
  // not just trusting whatever householdId the client sends.
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

  const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
  } = await callerClient.auth.getUser()
  if (!user) return json({ error: 'Invalid session' }, 401)

  // This is the one place that runs elevated — it must check membership
  // itself before touching anything else. See CLAUDE.md.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: membership } = await admin
    .from('household_members')
    .select('household_id')
    .eq('household_id', householdId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!membership) return json({ error: 'Not a member of this household' }, 403)

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await admin
    .from('meal_suggestions')
    .select('id', { count: 'exact', head: true })
    .eq('household_id', householdId)
    .gte('created_at', since)
  if ((count ?? 0) >= DAILY_LIMIT) {
    return json({ error: 'Daily suggestion limit reached, try again tomorrow' }, 429)
  }

  const { data: pantryRows, error: pantryError } = await admin
    .from('pantry_items')
    .select('name, expires_at')
    .eq('household_id', householdId)
    .eq('status', 'available')
    .limit(PANTRY_CAP)
  if (pantryError) return json({ error: 'Could not read pantry' }, 500)

  const pantryNames = (pantryRows ?? []).map((r) => r.name as string)
  const expiringSoonNames = (pantryRows ?? [])
    .filter((r) => isExpiringSoon(r.expires_at as string | null))
    .map((r) => r.name as string)
  const hash = await pantryHash(pantryNames, lang, preferences)

  if (!regenerate) {
    const { data: cached } = await admin
      .from('meal_suggestions')
      .select('payload')
      .eq('household_id', householdId)
      .eq('prompt_hash', hash)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (cached) {
      return json({ ...(cached.payload as object), cached: true })
    }
  }

  const { data: recentRows } = await admin
    .from('meal_suggestions')
    .select('payload')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(3)
  const recentMealNames = (recentRows ?? [])
    .flatMap((r) => (r.payload as { meals?: { name: string }[] })?.meals ?? [])
    .map((m) => m.name)

  let payload: { meals: unknown[]; fallback: boolean }
  try {
    const raw = await callGemini(
      GEMINI_API_KEY,
      pantryNames,
      recentMealNames,
      lang,
      preferences,
      expiringSoonNames,
    )
    const parsed = SuggestionsSchema.parse(raw)
    payload = { meals: parsed.meals, fallback: false }
  } catch (err) {
    console.error('Gemini call/parse failed, falling back:', err)
    payload = { meals: FALLBACK_MEALS[lang], fallback: true }
  }

  await admin
    .from('meal_suggestions')
    .insert({ household_id: householdId, prompt_hash: hash, payload })

  return json({ ...payload, cached: false })
})
