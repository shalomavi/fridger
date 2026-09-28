// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import '@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from '@supabase/supabase-js'
import { callGemini } from './gemini.ts'
import { ParseResultSchema } from './schema.ts'
import { parseRequestBody, type RequestBody } from './request.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!

const DAILY_LIMIT = 30

// Same reasoning as suggest-meals/index.ts: the browser calls this
// cross-origin, so every response needs these headers, not just success.
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

  let body: RequestBody
  try {
    body = await parseRequestBody(req)
  } catch {
    return json({ error: 'Expected JSON body with householdId and input.text' }, 400)
  }
  const { householdId, lang, input } = body

  // Real auth check from the caller's own JWT, same pattern as suggest-meals.
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

  const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
  } = await callerClient.auth.getUser()
  if (!user) return json({ error: 'Invalid session' }, 401)

  // Elevated client — must check membership itself before touching
  // anything else. See CLAUDE.md.
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
    .from('recipe_parses')
    .select('id', { count: 'exact', head: true })
    .eq('household_id', householdId)
    .gte('created_at', since)
  if ((count ?? 0) >= DAILY_LIMIT) {
    return json({ error: 'Daily import limit reached, try again tomorrow' }, 429)
  }

  let raw: unknown
  try {
    raw = await callGemini(GEMINI_API_KEY, input.text, lang)
  } catch (err) {
    console.error('Gemini call failed:', err)
    // Counts toward the daily limit even though it failed — it still cost a
    // call. See recipe_parses' migration comment.
    await admin.from('recipe_parses').insert({ household_id: householdId })
    return json({ error: "Couldn't read that as a recipe right now. Try again in a moment." }, 502)
  }
  await admin.from('recipe_parses').insert({ household_id: householdId })

  const parsed = ParseResultSchema.safeParse(raw)
  if (!parsed.success) {
    console.error('Gemini response failed schema validation:', parsed.error)
    return json({ error: "Couldn't read that as a recipe right now. Try again in a moment." }, 502)
  }

  return json(parsed.data)
})
