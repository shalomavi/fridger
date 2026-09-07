import { HouseholdPreferences } from './HouseholdPreferences'
import { CategoryOrderSettings } from './CategoryOrderSettings'

export function SettingsScreen() {
  return (
    <div className="space-y-8">
      <HouseholdPreferences />
      <CategoryOrderSettings />
    </div>
  )
}
