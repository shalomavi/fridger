import { MealLoader } from '@/features/meals/MealLoader'
import { AuthBackdrop } from '@/shared/ghostFibers/AuthBackdrop'

/** Full-screen loading state (initial session/household fetch) — the same
 * rotating pizza/burger/salad animation as the "suggest a meal" button's
 * loader, scaled up and centered, on top of the same animated shader
 * backdrop the login/household-setup screens use — not a plain flat
 * background replacing it. */
export function AppLoader() {
  return (
    <AuthBackdrop>
      <MealLoader size="lg" />
    </AuthBackdrop>
  )
}
