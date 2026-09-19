import { softFieldShadow, softFieldFocusShadow } from './elevation'

/** The "glass" look shared by every text field and the Select trigger:
 * mostly-transparent surface, primary focus ring. Exported so non-<input>
 * elements that should look like a field (Select's button) can reuse the
 * exact same classes instead of copying them.
 *
 * No resting ring/border — same as the nav tabs/buttons' elevationShadow,
 * which use only that shadow with no ring, so fields and buttons read as
 * one consistent "lifted surface" language instead of inputs alone having
 * an outline. The shadow itself: an inset dark line along the bottom
 * (shadow pooling at the glass' bottom edge), plus a tight "contact" shadow
 * right under the field and a larger, softer one further out (the same
 * near+far pairing real elevation shadows use) so it visibly lifts off the
 * page. A slight backdrop-blur (just the "sm" step) plus backdrop-saturate
 * so it still reads as glass rather than plain see-through — kept small on
 * purpose, and specific to fields; SearchInput's sticky strip stays
 * unblurred.
 *
 * Focus is an arbitrary shadow too, not ring-2/ring-primary: an arbitrary
 * shadow-[...] sets box-shadow directly rather than through the --tw-shadow
 * variable ring-* utilities compose with, so a plain focus:ring would
 * replace this whole shadow with just a flat ring instead of adding to it —
 * the "weird" jump on focus. Repeating the resting shadow plus a solid
 * 2px outline (0_0_0_2px) keeps the same depth while focused. */
export const fieldClass =
  `rounded-lg bg-surface/5 text-text outline-none ${softFieldShadow} backdrop-blur-sm backdrop-saturate-150 ${softFieldFocusShadow}`

/** Thin styled wrapper around <input>, same pattern as Button: the glass
 * look is baked in here, width/padding/icon-offset stay in the caller's
 * className so every call site keeps exact control over sizing. */
export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${className}`} />
}
