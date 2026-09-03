import { useEffect, useState } from 'react'
import { PizzaIcon } from './PizzaIcon'
import { TacoIcon } from './TacoIcon'
import { BurgerIcon } from './BurgerIcon'

type Kind = 'pizza' | 'burger' | 'taco'

const ICONS: Kind[] = ['pizza', 'burger', 'taco']
const STEP_MS = 1800

/** One food icon: a muted/grayscale layer with a full-color layer that
 * fills in over it, restarted (via the `key` the parent gives each icon)
 * every time it becomes the active one in the rotation.
 *
 * The outer box is fixed at h-6 w-6 — the same footprint the button's text
 * takes up — so swapping text for this never changes the button's height.
 * The icon itself is drawn bigger (h-9 w-9) inside that box and centered,
 * visually overflowing the reserved space without growing it. */
function FoodIcon({ kind }: { kind: Kind }) {
  const Icon = kind === 'pizza' ? PizzaIcon : kind === 'taco' ? TacoIcon : BurgerIcon
  return (
    <div className="flex h-6 w-6 items-center justify-center" aria-hidden="true">
      <div className="relative h-9 w-9">
        <Icon variant="muted" />
        <Icon variant="active" animationMs={STEP_MS} />
      </div>
    </div>
  )
}

/** Loader shown in place of "Thinking…" while the LLM builds meal
 * suggestions: a pizza, burger, and taco take turns filling with
 * color, one at a time. */
export function MealLoader() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ICONS.length), STEP_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-center">
      <FoodIcon key={index} kind={ICONS[index]} />
    </div>
  )
}
