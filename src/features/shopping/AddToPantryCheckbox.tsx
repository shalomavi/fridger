import { PantryIcon } from '@/shared/ui/FormIcons'

/** Same circular-checkmark look as ShoppingRow's toggle, at a smaller size
 * (h-4 vs h-5) since this is a secondary option on AddItemInput, not a
 * row-level action. A real checkbox input, visually hidden, drives it via
 * peer-checked — keeps native keyboard/screen-reader semantics instead of a
 * div faking a checkbox. Split out of AddItemInput to keep that file under
 * the size limit. */
export function AddToPantryCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text-muted">
      <span className="relative flex h-4 w-4 flex-none items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 h-4 w-4 cursor-pointer opacity-0"
        />
        <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-text-subtle transition-colors duration-300 peer-checked:border-primary peer-checked:bg-primary" />
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="pointer-events-none relative scale-0 transition-transform duration-300 peer-checked:scale-100"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <PantryIcon className="text-text-subtle" />
      {label}
    </label>
  )
}
