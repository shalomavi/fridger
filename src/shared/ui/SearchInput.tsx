import { SearchIcon } from '@/shared/ui/FormIcons'
import { Input } from '@/shared/ui/Input'

/** Plain text search box, styled to match AddItemInput's fields, with a
 * leading magnifying-glass icon in place of relying on the placeholder text
 * alone. Filtering itself lives in the caller (domain/filterByName) — this
 * is just the input.
 *
 * Sticks to the top of the viewport once scrolled there, with a translucent
 * strip behind it rather than a hard-edged input — -mx-6/px-6 bleed that
 * strip to the screen edges, assuming the same p-6 page padding both call
 * sites (ShoppingList/PantryList) share. No backdrop-blur, matching
 * Input.tsx's fieldClass — kept see-through rather than a blurred pane. */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="sticky top-0 z-10 -mx-6 bg-surface/5 px-6 py-2">
      <div className="relative">
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full py-3 ps-10 pe-4"
        />
        <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto text-text-subtle" />
      </div>
    </div>
  )
}
