/** Plain text search box, styled to match AddItemInput's fields. Filtering
 * itself lives in the caller (domain/filterByName) — this is just the input. */
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
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full rounded-lg bg-surface px-4 py-3 text-text outline-none focus:ring-2 focus:ring-primary-ring"
    />
  )
}
