import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSession, signOut } from '@/features/auth/useSession'
import { LoginForm } from '@/features/auth/LoginForm'

/** Slice 0 placeholder. Slice 1 replaces this with the shopping list. */
function HomeScreen({ email }: { email: string | undefined }) {
  return (
    <div className="min-h-dvh bg-slate-900 p-6 text-slate-100">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-teal-400">Fridger</h1>
        <button onClick={() => signOut()} className="text-sm text-slate-400">
          Sign out
        </button>
      </header>
      <p className="mt-8 text-slate-400">Signed in as {email}.</p>
    </div>
  )
}

export function AppRoutes() {
  const { session, loading } = useSession()

  if (loading) {
    return <div className="min-h-dvh bg-slate-900" />
  }

  if (!session) {
    return <LoginForm />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen email={session.user.email} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
