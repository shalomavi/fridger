import { admin, generateRawToken, sha256Hex } from '../shared.ts'

const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

async function issueTokenPair(clientId: string, householdId: string, userId: string): Promise<TokenPair> {
  const accessToken = generateRawToken()
  const refreshToken = generateRawToken()
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS)

  await admin.from('oauth_tokens').insert({
    client_id: clientId,
    household_id: householdId,
    user_id: userId,
    access_token_hash: await sha256Hex(accessToken),
    access_token_expires_at: expiresAt.toISOString(),
    refresh_token_hash: await sha256Hex(refreshToken),
  })

  return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_TTL_MS / 1000 }
}

export const createTokenPair = issueTokenPair

/** Resolves a live OAuth access token to its household, for the /mcp
 * resource-server check in auth.ts. */
export async function lookupAccessToken(rawToken: string): Promise<{ householdId: string } | null> {
  const { data: row } = await admin
    .from('oauth_tokens')
    .select('id, household_id, access_token_expires_at, revoked_at')
    .eq('access_token_hash', await sha256Hex(rawToken))
    .maybeSingle()
  if (!row || row.revoked_at || new Date(row.access_token_expires_at) < new Date()) return null

  await admin.from('oauth_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', row.id)
  return { householdId: row.household_id as string }
}

/** Refresh-token rotation (OAuth 2.1 best practice for public clients):
 * revokes the old grant row and issues a fresh access+refresh pair. */
export async function rotateRefreshToken(rawRefreshToken: string): Promise<TokenPair | null> {
  const { data: row } = await admin
    .from('oauth_tokens')
    .select('id, client_id, household_id, user_id, revoked_at')
    .eq('refresh_token_hash', await sha256Hex(rawRefreshToken))
    .maybeSingle()
  if (!row || row.revoked_at) return null

  await admin.from('oauth_tokens').update({ revoked_at: new Date().toISOString() }).eq('id', row.id)
  return issueTokenPair(row.client_id, row.household_id, row.user_id)
}

export async function listConnections(householdId: string) {
  const { data } = await admin
    .from('oauth_tokens')
    .select('id, client_id, created_at, last_used_at, oauth_clients(client_name)')
    .eq('household_id', householdId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function revokeConnection(id: string, householdId: string): Promise<boolean> {
  const { error } = await admin
    .from('oauth_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('household_id', householdId)
  return !error
}
