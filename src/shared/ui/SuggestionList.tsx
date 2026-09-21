import { normalizeName } from '@/domain/normalize'

const MAX_SUGGESTIONS = 6

/**
 * Dropdown of matching suggestions below a text field — a native
 * `<datalist>` was tried here first, but browsers' built-in filtering for
 * it is unreliable for non-Latin text (Hebrew input would show every
 * option regardless of the query on some browsers). Filtering itself uses
 * the same contiguous-substring `normalizeName` rule as filterByName.ts, so
 * search suggestions and actual search results never disagree — searching
 * "חלב" (milk) never suggests "קמח לבן" (white flour), since "חלב" isn't a
 * substring of it.
 *
 * `onMouseDown`'s preventDefault stops the field's blur from firing (and
 * hiding this list) before the click's own onClick registers.
 */
export function SuggestionList({
  suggestions,
  query,
  visible,
  onSelect,
}: {
  suggestions: string[]
  query: string
  visible: boolean
  onSelect: (value: string) => void
}) {
  if (!visible) return null

  const needle = normalizeName(query)
  const matches = suggestions
    .filter((s) => normalizeName(s) !== needle && (!needle || normalizeName(s).includes(needle)))
    .slice(0, MAX_SUGGESTIONS)
  if (matches.length === 0) return null

  return (
    <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-lg bg-surface py-1 shadow-lg ring-1 ring-inset ring-surface-muted/60">
      {matches.map((name) => (
        <li key={name}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(name)}
            className="block w-full px-3 py-2 text-start text-sm text-text hover:bg-surface-muted"
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  )
}
