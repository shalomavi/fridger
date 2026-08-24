import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom'
import { useSession, signOut } from '@/features/auth/useSession'
import { LoginForm } from '@/features/auth/LoginForm'
import { useHousehold, type Household } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { HouseholdSetup } from '@/features/household/HouseholdSetup'
import { InviteButton } from '@/features/household/InviteButton'
import { LanguageToggle } from '@/features/household/LanguageToggle'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { ShoppingList } from '@/features/shopping/ShoppingList'
import { PantryList } from '@/features/pantry/PantryList'
import { MealsScreen } from '@/features/meals/MealsScreen'
import { HouseholdPreferences } from '@/features/settings/HouseholdPreferences'

function tabClass({ isActive }: { isActive: boolean }) {
  return `flex flex-1 items-center justify-center rounded-lg py-2 text-center text-sm font-medium ${
    isActive ? 'bg-primary text-white' : 'bg-surface text-text-muted'
  }`
}

function Layout({ household, email }: { household: Household; email: string | undefined }) {
  const { lang, t } = useLanguage()

  return (
    <div
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      className={`min-h-dvh bg-app p-6 text-text ${lang === 'he' ? 'font-ui-he' : 'font-ui-en'}`}
    >
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary-accent">{household.name}</h1>
          <p className="text-xs text-text-subtle">{email}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <button onClick={() => signOut()} className="text-sm text-text-muted">
            {t('signOut')}
          </button>
        </div>
      </header>

      <div className="mb-6">
        <InviteButton householdId={household.id} />
      </div>

      <nav className="mb-6 flex gap-2">
        <NavLink to="/" end className={tabClass}>
          {t('tabShopping')}
        </NavLink>
        <NavLink to="/pantry" className={tabClass}>
          {t('tabPantry')}
        </NavLink>
        <NavLink to="/meals" className={tabClass}>
          {t('tabMeals')}
        </NavLink>
        <NavLink to="/settings" className={tabClass}>
          {t('tabSettings')}
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}

function HomeScreen({ email }: { email: string | undefined }) {
  const { data: household, isLoading } = useHousehold()

  if (isLoading) {
    return <div className="min-h-dvh bg-app" />
  }

  if (!household) {
    return <HouseholdSetup />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Routes>
        <Route element={<Layout household={household} email={email} />}>
          <Route path="/" element={<ShoppingList householdId={household.id} />} />
          <Route path="/pantry" element={<PantryList householdId={household.id} />} />
          <Route path="/meals" element={<MealsScreen householdId={household.id} />} />
          <Route path="/settings" element={<HouseholdPreferences />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  )
}

export function AppRoutes() {
  const { session, loading } = useSession()

  if (loading) {
    return <div className="min-h-dvh bg-app" />
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
