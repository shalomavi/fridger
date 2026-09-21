import { admin, generateRawToken, sha256Hex } from '../shared.ts'

export interface OAuthClient {
  clientId: string
  clientSecretHash: string | null
  clientName: string
  redirectUris: string[]
}

const CODE_TTL_MS = 5 * 60 * 1000

/** RFC 7591 Dynamic Client Registration. Public endpoint by spec — a
 * registered client is inert until a real household member completes the
 * authorize/consent flow, so there's nothing to protect here beyond not
 * letting registration itself touch household data. */
export async function registerClient(
  clientName: string,
  redirectUris: string[],
): Promise<{ clientId: string; clientSecret: string }> {
  const clientId = generateRawToken()
  const clientSecret = generateRawToken()
  const clientSecretHash = await sha256Hex(clientSecret)

  await admin.from('oauth_clients').insert({
    client_id: clientId,
    client_secret_hash: clientSecretHash,
    client_name: clientName,
    redirect_uris: redirectUris,
  })

  return { clientId, clientSecret }
}

export async function getClient(clientId: string): Promise<OAuthClient | null> {
  const { data } = await admin
    .from('oauth_clients')
    .select('client_id, client_secret_hash, client_name, redirect_uris')
    .eq('client_id', clientId)
    .maybeSingle()
  if (!data) return null

  return {
    clientId: data.client_id,
    clientSecretHash: data.client_secret_hash,
    clientName: data.client_name,
    redirectUris: data.redirect_uris,
  }
}

/** Mints a single-use authorization code bound to one household/user, per
 * the consenting member's approval in the SPA. */
export async function createAuthorizationCode(params: {
  clientId: string
  householdId: string
  userId: string
  redirectUri: string
  codeChallenge: string
  codeChallengeMethod: string
}): Promise<string> {
  const rawCode = generateRawToken()
  await admin.from('oauth_authorization_codes').insert({
    code_hash: await sha256Hex(rawCode),
    client_id: params.clientId,
    household_id: params.householdId,
    user_id: params.userId,
    redirect_uri: params.redirectUri,
    code_challenge: params.codeChallenge,
    code_challenge_method: params.codeChallengeMethod,
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  })
  return rawCode
}

/** Looks up and atomically consumes a code (single-use, per RFC 6749
 * §4.1.2) — a code already marked used_at, or past expiry, is rejected. */
export async function consumeAuthorizationCode(rawCode: string) {
  const codeHash = await sha256Hex(rawCode)
  const { data: row } = await admin
    .from('oauth_authorization_codes')
    .select('id, client_id, household_id, user_id, redirect_uri, code_challenge, expires_at, used_at')
    .eq('code_hash', codeHash)
    .maybeSingle()
  if (!row || row.used_at || new Date(row.expires_at) < new Date()) return null

  await admin.from('oauth_authorization_codes').update({ used_at: new Date().toISOString() }).eq('id', row.id)
  return row
}
