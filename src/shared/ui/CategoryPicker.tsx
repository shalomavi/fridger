import { CATEGORIES, type Category } from '@/shared/categories'
import { useLanguage } from '@/features/household/useLanguage'

/** Tap-to-pick category tag, same interaction pattern as AmountEditor/
 * ExpiryEditor: shown as underlined text; tapping swaps it for a native
 * <select> (which opens its own picker UI on tap — no custom dropdown
 * needed). Manual only — see categories.ts for why. */
export function CategoryPicker({
  category,
  onSave,
}: {
  category: Category | null
  onSave: (category: Category | null) => void
}) {
  const { t } = useLanguage()

  return (
    <select
      value={category ?? ''}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onChange={(e) => onSave((e.target.value || null) as Category | null)}
      className="bg-transparent text-sm text-text-subtle underline decoration-dotted underline-offset-2 outline-none"
    >
      <option value="">{t('categoryPlaceholder')}</option>
      {CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {t(`category_${c}`)}
        </option>
      ))}
    </select>
  )
}
