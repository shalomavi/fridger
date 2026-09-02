import { useEffect, useState } from 'react'
import { PizzaIcon } from './PizzaIcon'
import { TacoIcon } from './TacoIcon'
import { BurgerIcon } from './BurgerIcon'

type Kind = 'pizza' | 'burger' | 'taco'

const ICONS: Kind[] = ['pizza', 'burger', 'taco']
const STEP_MS = 1100

/** One food icon: a muted/grayscale layer with a full-color layer that
 * fills in over it, restarted (via the `key` the parent gives each icon)
 * every time it becomes the active one in the rotation. */
function FoodIcon({ kind }: { kind: Kind }) {
  const Icon = kind === 'pizza' ? PizzaIcon : kind === 'taco' ? TacoIcon : BurgerIcon
  return (
    <div className="relative h-8 w-8" aria-hidden="true">
      <Icon variant="muted" />
      <Icon variant="active" animationMs={STEP_MS} />
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
