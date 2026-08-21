import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom'
import { useSession, signOut } from '@/features/auth/useSession'
import { LoginForm } from '@/features/auth/LoginForm'
import { useHousehold, type Household } from '@/features/household/useHousehold'
import { HouseholdSetup } from '@/features/household/HouseholdSetup'
import { InviteButton } from '@/features/household/InviteButton'
import { ShoppingList } from '@/features/shopping/ShoppingList'
import { PantryList } from '@/features/pantry/PantryList'
import { MealsScreen } from '@/features/meals/MealsScreen'

function tabClass({ isActive }: { isActive: boolean }) {
  return `flex-1 rounded-lg py-2 text-center text-sm font-medium ${
    isActive ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'
  }`
}

function Layout({ household, email }: { household: Household; email: string | undefined }) {
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

      <nav className="mb-6 flex gap-2">
        <NavLink to="/" end className={tabClass}>
          Shopping list
        </NavLink>
        <NavLink to="/pantry" className={tabClass}>
          Pantry
        </NavLink>
        <NavLink to="/meals" className={tabClass}>
          Meals
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}

function HomeScreen({ email }: { email: string | undefined }) {
  const { data: household, isLoading } = useHousehold()

  if (isLoading) {
    return <div className="min-h-dvh bg-slate-900" />
  }

  if (!household) {
    return <HouseholdSetup />
  }

  return (
    <Routes>
      <Route element={<Layout household={household} email={email} />}>
        <Route path="/" element={<ShoppingList householdId={household.id} />} />
        <Route path="/pantry" element={<PantryList householdId={household.id} />} />
        <Route path="/meals" element={<MealsScreen householdId={household.id} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
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
      <HomeScreen email={session.user.email} />
    </BrowserRouter>
  )
}
