/** The "glass" look shared by every text field and the Select trigger:
 * translucent surface, inset ring, blur, primary focus ring. Exported so
 * non-<input> elements that should look like a field (Select's button) can
 * reuse the exact same classes instead of copying them.
 *
 * The 3D read comes from two shadows layered on top of the existing ring:
 * an inset white sheen along the top edge (light catching the glass) and a
 * soft outer drop shadow (lifting the field off the page instead of sitting
 * flush with it) — plus backdrop-saturate to make whatever's blurred behind
 * it read as richer glass rather than a flat frosted rectangle. */
export const fieldClass =
  'rounded-lg bg-surface/15 text-text outline-none ring-1 ring-inset ring-surface-muted/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_3px_10px_rgba(0,0,0,0.15)] backdrop-blur-lg backdrop-saturate-150 focus:ring-2 focus:ring-primary'

/** Thin styled wrapper around <input>, same pattern as Button: the glass
 * look is baked in here, width/padding/icon-offset stay in the caller's
 * className so every call site keeps exact control over sizing. */
export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${className}`} />
}
