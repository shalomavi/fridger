import { useEffect, useState } from 'react'
import { PizzaIcon } from './PizzaIcon'
import { TacoIcon } from './TacoIcon'

type Kind = 'pizza' | 'burger' | 'taco'

const ICONS: Kind[] = ['pizza', 'burger', 'taco']
const STEP_MS = 1100

// Burger's accent color once it's "cooking" — the base layer underneath
// always renders muted/gray via text-text-subtle. Pizza and taco are fully
// colored illustrations (see PizzaIcon/TacoIcon) rather than currentColor
// shapes, so they aren't drawn here.
const BURGER_ACCENT = '#a16207' // bun/patty brown

function BurgerShape() {
  return (
    <>
      <path d="M3 8a2 2 0 0 1 2-2c1-2.2 3.2-4 7-4s6 1.8 7 4a2 2 0 0 1 2 2Z" />
      <rect x="3" y="10.5" width="18" height="2.6" rx="1.3" />
      <rect x="3" y="14.5" width="18" height="4.5" rx="2.25" />
    </>
  )
}

/** One food icon: a muted base silhouette with a colored layer that fills
 * in over it, restarted (via the `key` the parent gives each icon) every
 * time it becomes the active one in the rotation. */
function FoodIcon({ kind }: { kind: Kind }) {
  if (kind === 'pizza') {
    return (
      <div className="relative h-8 w-8" aria-hidden="true">
        <PizzaIcon variant="muted" />
        <PizzaIcon variant="active" animationMs={STEP_MS} />
      </div>
    )
  }

  if (kind === 'taco') {
    return (
      <div className="relative h-8 w-8" aria-hidden="true">
        <TacoIcon variant="muted" />
        <TacoIcon variant="active" animationMs={STEP_MS} />
      </div>
    )
  }

  return (
    <div className="relative h-8 w-8" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full text-text-subtle opacity-40">
        <BurgerShape />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill={BURGER_ACCENT}
        className="absolute inset-0 h-full w-full"
        style={{ animation: `icon-fill ${STEP_MS}ms ease-out forwards` }}
      >
        <BurgerShape />
      </svg>
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
