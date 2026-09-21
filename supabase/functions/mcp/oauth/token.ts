import { sha256Hex } from '../shared.ts'
import { getClient, consumeAuthorizationCode } from './store.ts'
import { createTokenPair, rotateRefreshToken, type TokenPair } from './tokenStore.ts'
import { verifyPkce } from './pkce.ts'

function json(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

function tokenResponse(pair: TokenPair, corsHeaders: Record<string, string>) {
  return json(
    { access_token: pair.accessToken, token_type: 'Bearer', expires_in: pair.expiresIn, refresh_token: pair.refreshToken },
    200,
    corsHeaders,
  )
}

/** RFC 6749 §4.1.3 (authorization_code) and §6 (refresh_token) grants.
 * OAuth clients conventionally POST application/x-www-form-urlencoded, so
 * that's parsed first, with a JSON fallback for clients that don't. */
async function readParams(req: Request): Promise<URLSearchParams> {
  const contentType = req.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/json')) {
    const body = await req.json()
    return new URLSearchParams(body)
  }
  return new URLSearchParams(await req.text())
}

async function verifyClientAuth(clientId: string | null, clientSecret: string | null): Promise<boolean> {
  if (!clientId) return false
  const client = await getClient(clientId)
  if (!client) return false
  if (!client.clientSecretHash) return true // public client, PKCE-only
  return clientSecret ? (await sha256Hex(clientSecret)) === client.clientSecretHash : false
}

export async function handleToken(req: Request, corsHeaders: Record<string, string>): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'invalid_request' }, 405, corsHeaders)

  const params = await readParams(req)
  const grantType = params.get('grant_type')
  const clientId = params.get('client_id')
  const clientSecret = params.get('client_secret')

  if (!(await verifyClientAuth(clientId, clientSecret))) {
    return json({ error: 'invalid_client' }, 401, corsHeaders)
  }

  if (grantType === 'authorization_code') {
    const code = params.get('code')
    const verifier = params.get('code_verifier')
    const row = code ? await consumeAuthorizationCode(code) : null
    if (!row || row.client_id !== clientId || row.redirect_uri !== params.get('redirect_uri')) {
      return json({ error: 'invalid_grant' }, 400, corsHeaders)
    }
    if (!verifier || !(await verifyPkce(verifier, row.code_challenge))) {
      return json({ error: 'invalid_grant' }, 400, corsHeaders)
    }
    return tokenResponse(await createTokenPair(row.client_id, row.household_id, row.user_id), corsHeaders)
  }

  if (grantType === 'refresh_token') {
    const refreshToken = params.get('refresh_token')
    const pair = refreshToken ? await rotateRefreshToken(refreshToken) : null
    if (!pair) return json({ error: 'invalid_grant' }, 400, corsHeaders)
    return tokenResponse(pair, corsHeaders)
  }

  return json({ error: 'unsupported_grant_type' }, 400, corsHeaders)
}
