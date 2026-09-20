import { supabase } from '@/shared/supabase'

export type McpToken = {
  id: string
  label: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

/** Never select('*') here — token_hash lives on this row too, and RLS
 * can't hide individual columns, only rows. See 0022_mcp_tokens.sql. */
export async function listMcpTokens(householdId: string): Promise<McpToken[]> {
  const { data, error } = await supabase
    .from('mcp_tokens')
    .select('id, label, created_at, last_used_at, revoked_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Raw token hashing/storage happens server-side (supabase/functions/mcp/tokens.ts)
 * — the client never computes or sees the hash, only this one-time raw value. */
export async function generateMcpToken(householdId: string, label: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('mcp/tokens', {
    body: { householdId, label },
  })
  if (error) throw error
  return data.token as string
}

export async function revokeMcpToken(id: string): Promise<void> {
  const { error } = await supabase.from('mcp_tokens').update({ revoked_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}
