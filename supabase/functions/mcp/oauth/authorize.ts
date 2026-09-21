import * as z from 'zod/v4'
import { verifyHouseholdMember } from '../auth.ts'
import { getClient, createAuthorizationCode } from './store.ts'

// Where the SPA's consent screen lives — overridable for local dev against
// `netlify dev`/`vite` instead of the deployed production frontend.
const FRONTEND_URL = Deno.env.get('MCP_FRONTEND_URL') ?? 'https://fridger-app.netlify.app'

function json(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

/** GET /authorize — validates the request against the registered client,
 * then hands off to the SPA's own login/consent screen rather than
 * building a second login UI inside the Edge Function. */
export async function handleAuthorizeRequest(req: Request): Promise<Response> {
  const params = new URL(req.url).searchParams
  const clientId = params.get('client_id')
  const redirectUri = params.get('redirect_uri')
  const codeChallenge = params.get('code_challenge')

  const client = clientId ? await getClient(clientId) : null
  if (!client || !redirectUri || !client.redirectUris.includes(redirectUri) || !codeChallenge) {
    return new Response('Invalid client_id, redirect_uri, or code_challenge', { status: 400 })
  }
  if (params.get('response_type') !== 'code' || params.get('code_challenge_method') !== 'S256') {
    return new Response('Only response_type=code with code_challenge_method=S256 is supported', { status: 400 })
  }

  const forward = new URLSearchParams(params)
  return Response.redirect(`${FRONTEND_URL}/connect?${forward.toString()}`, 302)
}

const ApproveSchema = z.object({
  householdId: z.string().uuid(),
  clientId: z.string().min(1),
  redirectUri: z.string().url(),
  codeChallenge: z.string().min(1),
  codeChallengeMethod: z.literal('S256'),
  state: z.string(),
})

/** POST /authorize/approve — called by the SPA's consent screen with the
 * signed-in member's session JWT once they click Approve. Re-validates the
 * client/redirect_uri server-side rather than trusting what the SPA forwarded. */
export async function handleAuthorizeApprove(req: Request, corsHeaders: Record<string, string>): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405, corsHeaders)

  let body: z.infer<typeof ApproveSchema>
  try {
    body = ApproveSchema.parse(await req.json())
  } catch {
    return json({ error: 'invalid_request' }, 400, corsHeaders)
  }

  const member = await verifyHouseholdMember(req, body.householdId)
  if (!member) return json({ error: 'Not a member of this household' }, 403, corsHeaders)

  const client = await getClient(body.clientId)
  if (!client || !client.redirectUris.includes(body.redirectUri)) {
    return json({ error: 'invalid_client' }, 400, corsHeaders)
  }

  const code = await createAuthorizationCode({
    clientId: body.clientId,
    householdId: body.householdId,
    userId: member.userId,
    redirectUri: body.redirectUri,
    codeChallenge: body.codeChallenge,
    codeChallengeMethod: body.codeChallengeMethod,
  })

  const redirectUrl = new URL(body.redirectUri)
  redirectUrl.searchParams.set('code', code)
  redirectUrl.searchParams.set('state', body.state)

  return json({ redirectUrl: redirectUrl.toString() }, 200, corsHeaders)
}
