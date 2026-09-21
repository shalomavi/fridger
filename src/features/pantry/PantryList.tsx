import { useState } from 'react'
import { usePantry } from './usePantry'
import { PantryRow } from './PantryRow'
import { useHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { SearchInput } from '@/shared/ui/SearchInput'
import { CategoryHeading } from '@/shared/ui/CategoryHeading'
import { resolveCategoryOrder } from '@/shared/categories'
import { groupByCategory } from '@/domain/groupByCategory'
import { filterByName } from '@/domain/filterByName'
import { itemNameSuggestions } from '@/domain/itemNameSuggestions'
import { collectPantryAlerts } from '@/domain/alerts'
import { AlertBanner } from '@/shared/alerts/AlertBanner'
import { ScrollToTopButton } from '@/shared/ui/ScrollToTopButton'

export function PantryList({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const { data: items, isLoading, consume, updateDetails, updateQuantity, updateCategory, updateExpiry } =
    usePantry(householdId)
  const [query, setQuery] = useState('')

  const order = resolveCategoryOrder(household?.category_order)
  const matched = filterByName(items ?? [], query)
  const alerts = collectPantryAlerts(items ?? [])

  return (
    <div className="space-y-6">
      {!isLoading && items && items.length > 0 && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t('searchPlaceholder')}
          suggestions={itemNameSuggestions(items)}
        />
      )}

      {isLoading && <p className="text-text-subtle">{t('loading')}</p>}

      {!isLoading && (!items || items.length === 0) && (
        <p className="text-text-subtle">{t('pantryEmpty')}</p>
      )}

      {!isLoading && items && items.length > 0 && matched.length === 0 && (
        <p className="text-text-subtle">{t('noSearchResults')}</p>
      )}

      {!isLoading && items && items.length > 0 && <AlertBanner alerts={alerts} />}

      <div className="space-y-4">
        {groupByCategory(matched, order).map((group) => (
          <div key={group.category ?? 'uncategorized'}>
            <CategoryHeading category={group.category} />
            <ul className="space-y-2">
              {group.items.map((item) => (
                <PantryRow
                  key={item.id}
                  item={item}
                  onConsume={() => consume.mutate(item.id)}
                  onUpdateDetails={(details) => updateDetails.mutate({ id: item.id, details })}
                  onUpdateQuantity={(quantity, unit) => updateQuantity.mutate({ id: item.id, quantity, unit })}
                  onUpdateCategory={(category) => updateCategory.mutate({ id: item.id, category })}
                  onUpdateExpiry={(expiresAt) => updateExpiry.mutate({ id: item.id, expiresAt })}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <ScrollToTopButton label={t('scrollToTop')} />
    </div>
  )
}
