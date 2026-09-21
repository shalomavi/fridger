import { supabase } from '@/shared/supabase'

export type ConnectedApp = {
  id: string
  clientName: string
  createdAt: string
  lastUsedAt: string | null
}

/** oauth_tokens/oauth_clients have no client-side RLS access (see
 * 0023_oauth.sql) — unlike mcp_tokens, listing/revoking goes through the
 * mcp function itself, same as generateMcpToken does for issuance. */
export async function listConnectedApps(householdId: string): Promise<ConnectedApp[]> {
  const { data, error } = await supabase.functions.invoke('mcp/oauth/connections', { body: { householdId } })
  if (error) throw error
  return data as ConnectedApp[]
}

export async function revokeConnectedApp(householdId: string, connectionId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('mcp/oauth/connections/revoke', {
    body: { householdId, connectionId },
  })
  if (error) throw error
}
