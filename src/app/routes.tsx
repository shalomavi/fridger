import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom'
import { useSession, signOut } from '@/features/auth/useSession'
import { LoginForm } from '@/features/auth/LoginForm'
import { useHousehold, type Household } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { HouseholdSetup } from '@/features/household/HouseholdSetup'
import { LanguageToggle } from '@/features/household/LanguageToggle'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { ShoppingCartIcon, PantryIcon, MealsIcon, SettingsIcon } from '@/shared/ui/TabIcons'
import { elevationShadow, inactiveElevationShadow } from '@/shared/ui/elevation'
import { titleTextClass, titleGlow } from '@/shared/ui/titleGlow'
import { useTheme, type Theme } from '@/shared/useTheme'
import { ShoppingList } from '@/features/shopping/ShoppingList'
import { PantryList } from '@/features/pantry/PantryList'
import { MealsScreen } from '@/features/meals/MealsScreen'
import { SettingsScreen } from '@/features/settings/SettingsScreen'

// Curried on theme (a plain function, not a component, so it can't call
// useTheme() itself) — inactive tabs need inactiveElevationShadow's
// light-theme fix; active ones are fine with plain elevationShadow either
// way, since bg-primary's teal fill gives the white top sheen something to
// contrast against.
function tabClass(theme: Theme) {
  return ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 items-center justify-center rounded-lg py-3 transition-transform duration-300 active:scale-95 ${
      isActive
        ? `${elevationShadow} bg-primary text-white`
        : `${inactiveElevationShadow[theme]} bg-surface text-text-muted`
    }`
}

function Layout({ household, email }: { household: Household; email: string | undefined }) {
  const { lang, t } = useLanguage()
  const { theme } = useTheme()
  const navTabClass = tabClass(theme)

  return (
    <div
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      className={`min-h-dvh bg-app p-6 text-text ${lang === 'he' ? 'font-ui-he' : 'font-ui-en'}`}
    >
      <header className="mb-6 flex flex-col gap-1">
        {/* Title and toggles share one row so they vertically center against
         * each other directly — pairing them against mismatched-height
         * columns (title+email vs. toggles+sign-out) previously left the
         * large title looking lower than the small toggle icons. */}
        <div className="flex items-center justify-between gap-4">
          <h1 className={`min-w-0 truncate text-2xl font-semibold ${titleTextClass[theme]} ${titleGlow[theme]}`}>
            {household.name}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="min-w-0 truncate text-xs text-text-subtle">{email}</p>
          <button onClick={() => signOut()} className="shrink-0 text-sm text-text-muted underline">
            {t('signOut')}
          </button>
        </div>
      </header>

      <nav className="mb-6 flex gap-2">
        <NavLink to="/" end className={navTabClass} aria-label={t('tabShopping')}>
          <ShoppingCartIcon />
        </NavLink>
        <NavLink to="/pantry" className={navTabClass} aria-label={t('tabPantry')}>
          <PantryIcon />
        </NavLink>
        <NavLink to="/meals" className={navTabClass} aria-label={t('tabMeals')}>
          <MealsIcon />
        </NavLink>
        <NavLink to="/settings" className={navTabClass} aria-label={t('tabSettings')}>
          <SettingsIcon />
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
    <div className="max-w-5xl mx-auto">
      <Routes>
        <Route element={<Layout household={household} email={email} />}>
          <Route path="/" element={<ShoppingList householdId={household.id} />} />
          <Route path="/pantry" element={<PantryList householdId={household.id} />} />
          <Route path="/meals" element={<MealsScreen householdId={household.id} />} />
          <Route path="/settings" element={<SettingsScreen />} />
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
