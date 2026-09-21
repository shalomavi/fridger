import { useEffect, useState } from 'react'
import { PizzaIcon } from './PizzaIcon'
import { SaladIcon } from './SaladIcon'
import { BurgerIcon } from './BurgerIcon'

type Kind = 'pizza' | 'burger' | 'salad'
type Size = 'sm' | 'lg'

const ICONS: Kind[] = ['pizza', 'burger', 'salad']
const STEP_MS = 1800

// Tailwind needs statically-spelled class names to pick them up at build
// time, so sizes are a fixed lookup rather than an interpolated string.
const BOX_CLASS: Record<Size, string> = { sm: 'h-6 w-6', lg: 'h-20 w-20' }
const ICON_CLASS: Record<Size, string> = { sm: 'h-9 w-9', lg: 'h-[7.5rem] w-[7.5rem]' }

/** One food icon: a muted/grayscale layer with a full-color layer that
 * fills in over it, restarted (via the `key` the parent gives each icon)
 * every time it becomes the active one in the rotation.
 *
 * The outer box matches `size` — at `sm` it's the same footprint the
 * button's text takes up, so swapping text for this never changes the
 * button's height. The icon itself is drawn bigger inside that box and
 * centered, visually overflowing the reserved space without growing it. */
function FoodIcon({ kind, size }: { kind: Kind; size: Size }) {
  const Icon = kind === 'pizza' ? PizzaIcon : kind === 'salad' ? SaladIcon : BurgerIcon
  return (
    <div className={`flex items-center justify-center ${BOX_CLASS[size]}`} aria-hidden="true">
      <div className={`relative ${ICON_CLASS[size]}`}>
        <Icon variant="muted" />
        <Icon variant="active" animationMs={STEP_MS} />
      </div>
    </div>
  )
}

/** Loader shown in place of "Thinking…" while the LLM builds meal
 * suggestions: a pizza, burger, and taco take turns filling with
 * color, one at a time. `size="lg"` is the same animation scaled up, used
 * for full-screen app loading states. */
export function MealLoader({ size = 'sm' }: { size?: Size } = {}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ICONS.length), STEP_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-center">
      <FoodIcon key={index} kind={ICONS[index]} size={size} />
    </div>
  )
}
