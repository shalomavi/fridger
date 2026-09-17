/** The "glass" look shared by every text field and the Select trigger:
 * translucent surface, inset ring, blur, primary focus ring. Exported so
 * non-<input> elements that should look like a field (Select's button) can
 * reuse the exact same classes instead of copying them. */
export const fieldClass =
  'rounded-lg bg-surface/15 text-text outline-none ring-1 ring-inset ring-surface-muted/60 backdrop-blur-lg focus:ring-2 focus:ring-primary'

/** Thin styled wrapper around <input>, same pattern as Button: the glass
 * look is baked in here, width/padding/icon-offset stay in the caller's
 * className so every call site keeps exact control over sizing. */
export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${className}`} />
}
