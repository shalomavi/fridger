import { CATEGORIES, type Category } from '@/shared/categories'
import { useLanguage } from '@/features/household/useLanguage'
import { ChevronDownIcon } from '@/shared/ui/FormIcons'

/** Tap-to-pick category tag, same interaction pattern as AmountEditor/
 * ExpiryEditor: shown as underlined text with a chevron. The <select> itself
 * is an invisible full-size overlay (tap it anywhere to get the native
 * picker) rather than the visible control — a closed <select> renders as
 * wide as its widest *option*, not its selected value, so a visible select
 * left a big gap between "משק בית" and the chevron; an absolutely
 * positioned, opacity-0 select with an explicit w-full/h-full isn't subject
 * to that intrinsic sizing, so the visible text+chevron can sit right next
 * to each other. Manual category list only — see categories.ts for why. */
export function CategoryPicker({
  category,
  onSave,
}: {
  category: Category | null
  onSave: (category: Category | null) => void
}) {
  const { t } = useLanguage()

  return (
    <span className="relative inline-flex items-center gap-0.5">
      <span aria-hidden className="text-sm text-text-subtle underline decoration-dotted underline-offset-2">
        {category ? t(`category_${category}`) : t('categoryPlaceholder')}
      </span>
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
