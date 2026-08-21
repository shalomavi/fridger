import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/shared/supabase'

type SessionState = { session: Session | null; loading: boolean }

/** Current auth session, kept in sync with Supabase's own refresh cycle. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ session: null, loading: true })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, loading: false })
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false })
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return state
}

export function signOut() {
  return supabase.auth.signOut()
}
