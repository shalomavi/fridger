import * as z from 'zod/v4'
import { registerClient, getClient } from './store.ts'

const RegisterSchema = z.object({
  client_name: z.string().min(1).max(100),
  redirect_uris: z.array(z.string().url()).min(1),
})

function json(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

/** RFC 7591 Dynamic Client Registration — unauthenticated by spec. The
 * blast radius of an unvetted registration is low: a client_id/secret pair
 * is inert until a real household member approves it through /authorize. */
export async function handleRegister(req: Request, corsHeaders: Record<string, string>): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405, corsHeaders)

  let body: z.infer<typeof RegisterSchema>
  try {
    body = RegisterSchema.parse(await req.json())
  } catch {
    return json({ error: 'invalid_client_metadata' }, 400, corsHeaders)
  }

  const { clientId, clientSecret } = await registerClient(body.client_name, body.redirect_uris)

  return json(
    {
      client_id: clientId,
      client_secret: clientSecret,
      client_name: body.client_name,
      redirect_uris: body.redirect_uris,
      token_endpoint_auth_method: 'client_secret_post',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    },
    201,
    corsHeaders,
  )
}

/** GET /oauth/client?client_id=… — public client_name lookup for the SPA's
 * consent screen, before the user is even signed in. No secret exposed. */
export async function handleClientInfo(req: Request, corsHeaders: Record<string, string>): Promise<Response> {
  const clientId = new URL(req.url).searchParams.get('client_id')
  const client = clientId ? await getClient(clientId) : null
  if (!client) return json({ error: 'invalid_client' }, 404, corsHeaders)

  return json({ clientName: client.clientName }, 200, corsHeaders)
}
