import { MealLoader } from '@/features/meals/MealLoader'

/** Full-screen loading state (initial session/household fetch) — the same
 * rotating pizza/burger/salad animation as the "suggest a meal" button's
 * loader, scaled up and centered. */
export function AppLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-app">
      <MealLoader size="lg" />
    </div>
  )
}
