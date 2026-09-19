import { buttonShadow } from './elevation'

type ButtonVariant = 'primary' | 'outline' | 'secondary'

// outline has no fill, so it skips buttonShadow (a shadow implying a lifted
// solid surface would look wrong on a transparent background) in favor of
// a border in the same accent color used for its text.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: `${buttonShadow} bg-primary text-white`,
  outline: 'border border-primary-accent text-primary-accent',
  secondary: `${buttonShadow} bg-surface-muted text-text-soft`,
}

/** Thin styled wrapper around <button> — variant picks the fill/text color
 * from the semantic tokens; width, padding, and text size stay in the
 * caller's className so every call site keeps exact control over sizing. */
export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={`rounded-lg font-medium transition-transform duration-300 active:scale-95 disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
    />
  )
}
