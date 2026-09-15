import type { TKey } from '@/shared/i18n'
import { useLanguage } from '@/features/household/useLanguage'
import { CATEGORY_ICONS } from '@/shared/ui/CategoryIcons'
import type { Category } from '@/shared/categories'

/** Section header above a category group in the shopping list/pantry. Shows
 * just the category's icon — the name still reaches screen readers via
 * sr-only text — except for the trailing "uncategorized" group, which has
 * no icon and keeps its label visible (see the icon-only decision this
 * mirrors for the tab bar). */
export function CategoryHeading({ category }: { category: string | null }) {
  const { t } = useLanguage()

  if (!category) {
    return <p className="mb-2 text-xs uppercase tracking-wide text-text-subtle">{t('uncategorized')}</p>
  }

  const Icon = CATEGORY_ICONS[category as Category]
  return (
    <p className="mb-2 text-text-subtle">
      <Icon />
      <span className="sr-only">{t(`category_${category}` as TKey)}</span>
    </p>
  )
}
