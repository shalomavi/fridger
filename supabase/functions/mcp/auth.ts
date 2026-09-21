import { createClient } from '@supabase/supabase-js'
import { admin, SUPABASE_URL, SERVICE_ROLE_KEY, sha256Hex } from './shared.ts'
import { lookupAccessToken } from './oauth/tokenStore.ts'

export { admin, sha256Hex, generateRawToken } from './shared.ts'

/** Verifies the caller's own Supabase session JWT and that they belong to
 * the household they claim — same pattern as suggest-meals/index.ts. Used
 * only by the /mcp/tokens management route (called from the Fridger app
 * itself, a real signed-in user), never by the /mcp protocol route. */
export async function verifyHouseholdMember(
  req: Request,
  householdId: string,
): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
  } = await callerClient.auth.getUser()
  if (!user) return null

  const { data: membership } = await admin
    .from('household_members')
    .select('household_id')
    .eq('household_id', householdId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!membership) return null

  return { userId: user.id }
}

/** Verifies a bearer token for the /mcp protocol route — either the static
 * per-household token (Claude, §2/§7a) or an OAuth access token (Gemini and
 * future clients requiring real OAuth, §7b/§7c/oauth/). No client-supplied
 * householdId anywhere in this path — either token kind is already scoped
 * to exactly one household, so there's nothing to cross-check like
 * verifyHouseholdMember does. */
export async function verifyBearerToken(req: Request): Promise<{ householdId: string } | null> {
  const token = req.headers.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return null

  const oauthMatch = await lookupAccessToken(token)
  if (oauthMatch) return oauthMatch

  const tokenHash = await sha256Hex(token)
  const { data: row } = await admin
    .from('mcp_tokens')
    .select('id, household_id, revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()
  if (!row || row.revoked_at) return null

  await admin.from('mcp_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', row.id)

  return { householdId: row.household_id as string }
}
