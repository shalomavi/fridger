import { supabase } from '@/shared/supabase'

export type Household = { id: string; name: string }

/** The caller's household, or null if they haven't created/joined one yet. */
export async function getMyHousehold(): Promise<Household | null> {
  const { data: membership, error: membershipError } = await supabase
    .from('household_members')
    .select('household_id')
    .limit(1)
    .maybeSingle()
  if (membershipError) throw membershipError
  if (!membership) return null

  const { data: household, error } = await supabase
    .from('households')
    .select('id, name')
    .eq('id', membership.household_id)
    .single()
  if (error) throw error
  return household
}

/** Creates a household and makes the current user its first (owner) member. */
export async function createHousehold(name: string): Promise<Household> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data: household, error } = await supabase
    .from('households')
    .insert({ name })
    .select('id, name')
    .single()
  if (error) throw error

  const { error: memberError } = await supabase
    .from('household_members')
    .insert({ household_id: household.id, user_id: user.id, role: 'owner' })
  if (memberError) throw memberError

  return household
}

/** Generates a short-lived invite code for the caller's household. */
export async function createInvite(householdId: string): Promise<string> {
  const code = crypto.randomUUID().slice(0, 8).toUpperCase()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('invites')
    .insert({ code, household_id: householdId, expires_at: expiresAt })
  if (error) throw error
  return code
}

/** Joins the household behind an invite code. Throws if it's invalid, used, or expired. */
export async function joinHousehold(code: string): Promise<Household> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const normalized = code.trim().toUpperCase()
  const { data: invite, error } = await supabase
    .from('invites')
    .select('code, household_id, expires_at, used_by')
    .eq('code', normalized)
    .maybeSingle()
  if (error) throw error
  if (!invite) throw new Error('Invite code not found')
  if (invite.used_by) throw new Error('Invite code already used')
  if (new Date(invite.expires_at) < new Date()) throw new Error('Invite code expired')

  const { error: claimError } = await supabase
    .from('invites')
    .update({ used_by: user.id })
    .eq('code', normalized)
  if (claimError) throw new Error('Invite code was just claimed by someone else')

  const { error: memberError } = await supabase
    .from('household_members')
    .insert({ household_id: invite.household_id, user_id: user.id, role: 'member' })
  if (memberError) throw memberError

  const { data: household, error: householdError } = await supabase
    .from('households')
    .select('id, name')
    .eq('id', invite.household_id)
    .single()
  if (householdError) throw householdError
  return household
}
