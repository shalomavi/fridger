import { useHousehold } from '@/features/household/useHousehold'
import { InviteButton } from '@/features/household/InviteButton'
import { HouseholdPreferences } from './HouseholdPreferences'
import { CategoryOrderSettings } from './CategoryOrderSettings'
import { ProduceExpirySettings } from './ProduceExpirySettings'
import { MealTypeSettings } from './MealTypeSettings'
import { McpTokenSettings } from './McpTokenSettings'
import { ConnectedAppsSettings } from './ConnectedAppsSettings'

export function SettingsScreen() {
  const { data: household } = useHousehold()

  return (
    <div className="space-y-8">
      {household && <InviteButton householdId={household.id} />}
      <MealTypeSettings />
      <HouseholdPreferences />
      <CategoryOrderSettings />
      <ProduceExpirySettings />
      <McpTokenSettings />
      <ConnectedAppsSettings />
    </div>
  )
}
