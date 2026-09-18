/** The "glass" look shared by every text field and the Select trigger:
 * translucent surface, inset ring, blur, primary focus ring. Exported so
 * non-<input> elements that should look like a field (Select's button) can
 * reuse the exact same classes instead of copying them.
 *
 * Three shadows layered on top of the existing ring build the 3D read: an
 * inset dark line along the bottom (shadow pooling at the glass' bottom
 * edge), plus a tight "contact" shadow right under the field and a larger,
 * softer one further out (the same near+far pairing real elevation shadows
 * use) so it visibly lifts off the page. No white top sheen — same plain
 * top edge as the nav tabs/buttons' elevationShadow, rather than a bright
 * highlight line unique to inputs. backdrop-saturate makes whatever's
 * blurred behind it read as richer glass. */
export const fieldClass =
  'rounded-lg bg-surface/25 text-text outline-none ring-1 ring-inset ring-surface-muted/80 shadow-[inset_0_-2px_0_rgba(0,0,0,0.35),0_2px_4px_rgba(0,0,0,0.3),0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150 focus:ring-2 focus:ring-primary'

/** Thin styled wrapper around <input>, same pattern as Button: the glass
 * look is baked in here, width/padding/icon-offset stay in the caller's
 * className so every call site keeps exact control over sizing. */
export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${className}`} />
}
