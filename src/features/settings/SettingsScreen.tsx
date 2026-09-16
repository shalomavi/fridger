import { HouseholdPreferences } from './HouseholdPreferences'
import { CategoryOrderSettings } from './CategoryOrderSettings'
import { MealTypeSettings } from './MealTypeSettings'

export function SettingsScreen() {
  return (
    <div className="space-y-8">
      <MealTypeSettings />
      <HouseholdPreferences />
      <CategoryOrderSettings />
    </div>
  )
}
