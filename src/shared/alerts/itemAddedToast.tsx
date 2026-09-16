import type { ReactNode } from 'react'
import type { Category } from '@/shared/categories'
import type { TKey } from '@/shared/i18n'
import { CATEGORY_ICONS } from '@/shared/ui/CategoryIcons'
import { CheckCircleIcon } from '@/shared/ui/FormIcons'

/**
 * Icon + message for an "item added" toast — a success check next to the
 * destination's category icon (matching CategoryHeading: no icon, just the
 * label, for "uncategorized"). Any other "added to X" flow can reuse this
 * instead of hand-rolling its own toast content.
 */
export function itemAddedToastContent(
  category: Category | null,
  t: (key: TKey) => string,
): { message: string; icon: ReactNode } {
  const CategoryIcon = category ? CATEGORY_ICONS[category] : null
  const label = category ? t(`category_${category}` as TKey) : t('uncategorized')

  return {
    message: `${t('addedTo')} ${label}`,
    icon: (
      <span className="flex items-center gap-1">
        <CheckCircleIcon className="text-primary" />
        {CategoryIcon && <CategoryIcon className="text-text-muted" />}
      </span>
    ),
  }
}
