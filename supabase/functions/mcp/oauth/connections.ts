import * as z from 'zod/v4'
import { verifyHouseholdMember } from '../auth.ts'
import { listConnections, revokeConnection } from './tokenStore.ts'

function json(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

const HouseholdBodySchema = z.object({ householdId: z.string().uuid() })

/** POST /oauth/connections — mirrors /mcp/tokens' management pattern
 * (JSON body, not query params, same as handleCreateToken), but these rows
 * have no client-side RLS access (see 0023_oauth.sql), so listing/revoking
 * has to go through the Edge Function. */
export async function handleListConnections(req: Request, corsHeaders: Record<string, string>): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405, corsHeaders)

  let body: z.infer<typeof HouseholdBodySchema>
  try {
    body = HouseholdBodySchema.parse(await req.json())
  } catch {
    return json({ error: 'householdId required' }, 400, corsHeaders)
  }

  const member = await verifyHouseholdMember(req, body.householdId)
  if (!member) return json({ error: 'Not a member of this household' }, 403, corsHeaders)

  const rows = await listConnections(body.householdId)
  return json(
    rows.map((row) => ({
      id: row.id,
      clientName: (row.oauth_clients as unknown as { client_name: string } | null)?.client_name ?? 'Unknown app',
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
    })),
    200,
    corsHeaders,
  )
}

const RevokeSchema = z.object({ householdId: z.string().uuid(), connectionId: z.string().uuid() })

export async function handleRevokeConnection(req: Request, corsHeaders: Record<string, string>): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405, corsHeaders)

  let body: z.infer<typeof RevokeSchema>
  try {
    body = RevokeSchema.parse(await req.json())
  } catch {
    return json({ error: 'householdId and connectionId required' }, 400, corsHeaders)
  }

  const member = await verifyHouseholdMember(req, body.householdId)
  if (!member) return json({ error: 'Not a member of this household' }, 403, corsHeaders)

  const ok = await revokeConnection(body.connectionId, body.householdId)
  return json({ ok }, ok ? 200 : 500, corsHeaders)
}
