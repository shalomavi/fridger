import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSession, signOut } from '@/features/auth/useSession'
import { LoginForm } from '@/features/auth/LoginForm'
import { useHousehold } from '@/features/household/useHousehold'
import { HouseholdSetup } from '@/features/household/HouseholdSetup'
import { InviteButton } from '@/features/household/InviteButton'
import { ShoppingList } from '@/features/shopping/ShoppingList'

function HomeScreen({ email }: { email: string | undefined }) {
  const { data: household, isLoading } = useHousehold()

  if (isLoading) {
    return <div className="min-h-dvh bg-slate-900" />
  }

  if (!household) {
    return <HouseholdSetup />
  }

  return (
    <div className="min-h-dvh bg-slate-900 p-6 text-slate-100">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-teal-400">{household.name}</h1>
          <p className="text-xs text-slate-500">{email}</p>
        </div>
        <button onClick={() => signOut()} className="text-sm text-slate-400">
          Sign out
        </button>
      </header>

      <div className="mb-6">
        <InviteButton householdId={household.id} />
      </div>

      <ShoppingList householdId={household.id} />
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
