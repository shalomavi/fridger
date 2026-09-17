import { useHousehold } from '@/features/household/useHousehold'
import { InviteButton } from '@/features/household/InviteButton'
import { HouseholdPreferences } from './HouseholdPreferences'
import { CategoryOrderSettings } from './CategoryOrderSettings'
import { MealTypeSettings } from './MealTypeSettings'

export function SettingsScreen() {
  const { data: household } = useHousehold()

  return (
    <div className="space-y-8">
      {household && <InviteButton householdId={household.id} />}
      <MealTypeSettings />
      <HouseholdPreferences />
      <CategoryOrderSettings />
    </div>
  )
}
