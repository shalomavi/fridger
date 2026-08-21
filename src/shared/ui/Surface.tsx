import type { ComponentPropsWithoutRef, ElementType } from 'react'

type SurfaceProps<T extends ElementType> = {
  as?: T
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

/** The repeated "rounded-lg bg-surface" card/row wrapper — polymorphic so it
 * can render as a <div>, <li>, etc. depending on where it's used. */
export function Surface<T extends ElementType = 'div'>({
  as,
  className = '',
  ...props
}: SurfaceProps<T>) {
  const Component = as ?? 'div'
  return <Component className={`rounded-lg bg-surface ${className}`} {...props} />
}
