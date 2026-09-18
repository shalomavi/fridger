/** The "glass" look shared by every text field and the Select trigger:
 * translucent surface, inset ring, blur, primary focus ring. Exported so
 * non-<input> elements that should look like a field (Select's button) can
 * reuse the exact same classes instead of copying them.
 *
 * Four shadows layered on top of the existing ring build the 3D read: an
 * inset white sheen along the top edge and a matching inset dark line along
 * the bottom (light catching the glass' top, shadow pooling at its bottom —
 * together they read as a beveled edge with real thickness, not a flat
 * rectangle), plus a tight "contact" shadow right under the field and a
 * larger, softer one further out (the same near+far pairing real elevation
 * shadows use) so it visibly lifts off the page. backdrop-saturate makes
 * whatever's blurred behind it read as richer glass. */
export const fieldClass =
  'rounded-lg bg-surface/15 text-text outline-none ring-1 ring-inset ring-surface-muted/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.12),0_8px_20px_rgba(0,0,0,0.22)] backdrop-blur-xl backdrop-saturate-150 focus:ring-2 focus:ring-primary'

/** Thin styled wrapper around <input>, same pattern as Button: the glass
 * look is baked in here, width/padding/icon-offset stay in the caller's
 * className so every call site keeps exact control over sizing. */
export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${className}`} />
}
