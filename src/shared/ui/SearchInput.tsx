import { SearchIcon } from '@/shared/ui/FormIcons'

/** Plain text search box, styled to match AddItemInput's fields, with a
 * leading magnifying-glass icon in place of relying on the placeholder text
 * alone. Filtering itself lives in the caller (domain/filterByName) — this
 * is just the input. */
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
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg bg-surface py-3 ps-10 pe-4 text-text outline-none focus:ring-2 focus:ring-primary-ring"
      />
      <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto text-text-subtle" />
    </div>
  )
}
