import { CATEGORIES, type Category } from '@/shared/categories'
import { useLanguage } from '@/features/household/useLanguage'
import { ChevronDownIcon } from '@/shared/ui/FormIcons'

/** Tap-to-pick category tag, same interaction pattern as AmountEditor/
 * ExpiryEditor: shown as underlined text; tapping swaps it for a native
 * <select> (which opens its own picker UI on tap — no custom dropdown
 * needed). Manual only — see categories.ts for why. The select's own arrow
 * is turned off (appearance-none) and a small chevron placed right against
 * the text instead — the native one left a wide gap. */
export function CategoryPicker({
  category,
  onSave,
}: {
  category: Category | null
  onSave: (category: Category | null) => void
}) {
  const { t } = useLanguage()

  return (
    <label className="inline-flex items-center gap-0.5">
      <select
        value={category ?? ''}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => onSave((e.target.value || null) as Category | null)}
        className="appearance-none bg-transparent text-sm text-text-subtle underline decoration-dotted underline-offset-2 outline-none"
      >
        <option value="">{t('categoryPlaceholder')}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(`category_${c}`)}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="h-3 w-3 text-text-subtle" />
    </label>
  )
}
