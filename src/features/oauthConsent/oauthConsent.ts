import { supabase } from '@/shared/supabase'

export type ConsentRequest = {
  householdId: string
  clientId: string
  redirectUri: string
  codeChallenge: string
  codeChallengeMethod: string
  state: string
}

/** Public — no session needed — so this is a plain fetch to the mcp
 * function's verify_jwt=false route (see supabase/config.toml), not
 * supabase.functions.invoke (which is for the authenticated POST below). */
export async function getOAuthClientName(clientId: string): Promise<string> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp/oauth/client?client_id=${encodeURIComponent(clientId)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('invalid_client')
  const data = await res.json()
  return data.clientName as string
}

/** Mints a single-use authorization code for the consenting household
 * member and returns the client's redirect URL to navigate to. */
export async function approveOAuthConsent(request: ConsentRequest): Promise<string> {
  const { data, error } = await supabase.functions.invoke('mcp/authorize/approve', { body: request })
  if (error) throw error
  return data.redirectUrl as string
}
