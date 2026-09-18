/** The "glass" look shared by every text field and the Select trigger:
 * translucent surface, blur, primary focus ring. Exported so non-<input>
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
 * page. backdrop-saturate makes whatever's blurred behind it read as richer
 * glass. focus:ring is the one ring that's kept, as an interaction cue. */
export const fieldClass =
  'rounded-lg bg-surface/10 text-text outline-none shadow-[inset_0_-2px_0_rgba(0,0,0,0.35),0_2px_4px_rgba(0,0,0,0.3),0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150 focus:ring-2 focus:ring-primary'

/** Thin styled wrapper around <input>, same pattern as Button: the glass
 * look is baked in here, width/padding/icon-offset stay in the caller's
 * className so every call site keeps exact control over sizing. */
export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${className}`} />
}
