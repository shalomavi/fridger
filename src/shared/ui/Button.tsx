type ButtonVariant = 'primary' | 'secondary'

/** Thin styled wrapper around <button> — variant picks the fill/text color
 * from the semantic tokens; width, padding, and text size stay in the
 * caller's className so every call site keeps exact control over sizing. */
export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variantClass = variant === 'primary' ? 'bg-primary text-white' : 'bg-surface text-text'
  return (
    <button
      {...props}
      className={`rounded-lg font-medium disabled:opacity-50 ${variantClass} ${className}`}
    />
  )
}
