import { useTheme } from '@/shared/useTheme'
import { buttonShadow } from './elevation'

type ButtonVariant = 'primary' | 'surface' | 'secondary'

// surface is bg-surface in light theme, but bg-surface-muted (secondary's
// fill) in dark theme — same per-theme split pattern as
// inactiveElevationShadow in elevation.ts.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: `${buttonShadow} bg-primary text-white`,
  surface: `${buttonShadow} bg-surface text-text-soft`,
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
  const { theme } = useTheme()
  const variantClass = variant === 'surface' && theme === 'dark' ? VARIANT_CLASS.secondary : VARIANT_CLASS[variant]
  return (
    <button
      {...props}
      className={`rounded-lg font-medium transition-transform duration-300 active:scale-95 disabled:opacity-50 ${variantClass} ${className}`}
    />
  )
}
