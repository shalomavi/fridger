import { useState } from 'react'
import { SearchIcon } from '@/shared/ui/FormIcons'
import { Input } from '@/shared/ui/Input'
import { SuggestionList } from '@/shared/ui/SuggestionList'

/** Plain text search box, styled to match AddItemInput's fields, with a
 * leading magnifying-glass icon in place of relying on the placeholder text
 * alone. Filtering itself lives in the caller (domain/filterByName) — this
 * is just the input.
 *
 * Sticks near the top of the viewport once scrolled there, with a
 * translucent strip behind it rather than a hard-edged input — -mx-6/px-6
 * bleed that strip to the screen edges, assuming the same p-6 page padding
 * both call sites (ShoppingList/PantryList) share. No backdrop-blur,
 * matching Input.tsx's fieldClass — kept see-through rather than a
 * blurred pane.
 *
 * top-2 (not top-0) is what gives the pinned field its breathing room from
 * the viewport edge — sticky's offset only applies once scrolling would
 * push the element past it, so at rest (e.g. as PantryList's first
 * element) the field still sits flush with AddItemInput's/the meals
 * Button's position, same as top-0 would. No padding needed to fake that
 * gap, so the box's size never changes between resting and stuck — no
 * conditional class, no jump, no stuck-state detection required. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  suggestions,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  suggestions?: string[]
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="sticky top-2 z-10 -mx-6 bg-surface/5 px-6">
      <div className="relative">
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full py-3 ps-8 pe-3"
        />
        <SearchIcon className="pointer-events-none absolute inset-y-0 start-2.5 my-auto text-text-subtle" />
        {suggestions && (
          <SuggestionList
            suggestions={suggestions}
            query={value}
            visible={focused}
            onSelect={(name) => {
              onChange(name)
              setFocused(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
