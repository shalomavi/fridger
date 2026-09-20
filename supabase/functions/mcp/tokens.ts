import * as z from 'zod/v4'
import { admin, generateRawToken, sha256Hex, verifyHouseholdMember } from './auth.ts'

const CreateTokenSchema = z.object({
  householdId: z.string().uuid(),
  label: z.string().min(1).max(60),
})

function json(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

/** Issues a new household MCP token. list/revoke don't need a round trip
 * here — they're plain RLS-scoped queries from the client (see
 * McpTokenSettings.tsx) — but issuance must happen server-side since the
 * raw token can only ever be shown once and its hash must never pass
 * through client trust. */
export async function handleCreateToken(req: Request, corsHeaders: Record<string, string>): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405, corsHeaders)

  let body: z.infer<typeof CreateTokenSchema>
  try {
    body = CreateTokenSchema.parse(await req.json())
  } catch {
    return json({ error: 'Expected JSON body with householdId and label' }, 400, corsHeaders)
  }

  const member = await verifyHouseholdMember(req, body.householdId)
  if (!member) return json({ error: 'Not a member of this household' }, 403, corsHeaders)

  const rawToken = generateRawToken()
  const tokenHash = await sha256Hex(rawToken)

  const { data, error } = await admin
    .from('mcp_tokens')
    .insert({ household_id: body.householdId, user_id: member.userId, token_hash: tokenHash, label: body.label })
    .select('id, label, created_at')
    .single()
  if (error || !data) return json({ error: 'Could not create token' }, 500, corsHeaders)

  return json({ id: data.id, label: data.label, createdAt: data.created_at, token: rawToken }, 200, corsHeaders)
}
