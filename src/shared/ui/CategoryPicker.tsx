import { CATEGORIES, type Category } from '@/shared/categories'
import { useLanguage } from '@/features/household/useLanguage'
import { ChevronDownIcon, TagIcon } from '@/shared/ui/FormIcons'
import { CATEGORY_ICONS } from '@/shared/ui/CategoryIcons'

/** Tap-to-pick category tag, same interaction pattern as DetailsEditor/
 * ExpiryEditor: shown as an icon (name kept for screen readers) with a
 * chevron. The <select> itself is an invisible full-size overlay (tap it
 * anywhere to get the native picker) rather than the visible control — a
 * closed <select> renders as wide as its widest *option*, not its selected
 * value, so a visible select left a big gap before the chevron; an
 * absolutely positioned, opacity-0 select with an explicit w-full/h-full
 * isn't subject to that intrinsic sizing. Manual category list only — see
 * categories.ts for why. */
export function CategoryPicker({
  category,
  onSave,
}: {
  category: Category | null
  onSave: (category: Category | null) => void
}) {
  const { t } = useLanguage()
  const Icon = category ? CATEGORY_ICONS[category] : TagIcon

  return (
    <span className="relative inline-flex items-center gap-0.5">
      <Icon className="text-text-subtle" />
      <span className="sr-only">{category ? t(`category_${category}`) : t('categoryPlaceholder')}</span>
      <ChevronDownIcon className="h-3 w-3 text-text-subtle" />
      <select
        value={category ?? ''}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => onSave((e.target.value || null) as Category | null)}
        aria-label={t('categoryPlaceholder')}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="">{t('categoryPlaceholder')}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(`category_${c}`)}
          </option>
        ))}
      </select>
    </span>
  )
}
