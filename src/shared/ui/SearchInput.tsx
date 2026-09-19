import { SearchIcon } from '@/shared/ui/FormIcons'
import { Input } from '@/shared/ui/Input'
import { useStuck } from '@/shared/ui/useStuck'

/** Plain text search box, styled to match AddItemInput's fields, with a
 * leading magnifying-glass icon in place of relying on the placeholder text
 * alone. Filtering itself lives in the caller (domain/filterByName) — this
 * is just the input.
 *
 * Sticks to the top of the viewport once scrolled there, with a translucent
 * strip behind it rather than a hard-edged input — -mx-6/px-6 bleed that
 * strip to the screen edges, assuming the same p-6 page padding both call
 * sites (ShoppingList/PantryList) share. The strip has no vertical padding
 * at rest, so the field's top edge sits flush with AddItemInput's/the
 * meals Button's when this is the first element on the page (PantryList)
 * — but flush also means the field would touch the very top of the
 * viewport once actually pinned there, which looks cramped. useStuck (a
 * sentinel + IntersectionObserver, the standard way to detect a pinned
 * sticky element since CSS has no selector for it) adds that breathing
 * room back in only while stuck — animated (transition-[padding]) rather
 * than toggled instantly, so the reflow it causes in whatever follows
 * reads as a smooth expand instead of a jump. No backdrop-blur, matching
 * Input.tsx's fieldClass — kept see-through rather than a blurred pane.
 *
 * Renders as a fragment (sentinel + sticky box as true top-level
 * siblings), not wrapped in a div: position: sticky can only stay pinned
 * while its own parent's box is still on screen, so the sticky box needs
 * the full-height list (space-y-6 div in ShoppingList/PantryList) as its
 * containing block, not a wrapper barely taller than itself — that would
 * cut its stick range down to almost nothing.
 *
 * That means space-y-6 sees the sentinel and sticky box as two separate
 * children and puts its usual margin-top gap between *both* — the gap
 * before the sentinel is the real, wanted one (e.g. below AddItemInput),
 * but the one between the sentinel and the box isn't, so -mt-6 on the box
 * cancels that second gap back to zero. Assumes both call sites keep
 * using space-y-6, same assumption as the -mx-6/px-6 bleed below. */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const { sentinelRef, stuck } = useStuck<HTMLDivElement>()

  return (
    <>
      <div ref={sentinelRef} className="h-px" />
      <div
        className={`sticky top-0 z-10 -mx-6 -mt-6 bg-surface/5 px-6 transition-[padding] duration-200 ${stuck ? 'py-2' : ''}`}
      >
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
    </>
  )
}
