type Variant = 'muted' | 'active'

const BUN = '#e8c17a' // top and bottom bun
const PATTY = '#7b4b23'
const TOMATO = '#dc2626'
const LETTUCE = '#8bc34a'

function BurgerShape() {
  return (
    <>
      <path d="M3 8a2 2 0 0 1 2-2c1-2.2 3.2-4 7-4s6 1.8 7 4a2 2 0 0 1 2 2Z" fill={BUN} />
      <rect x="2" y="9" width="20" height="1" rx="0.5" fill={LETTUCE} />
      <rect x="2.5" y="10.3" width="19" height="1.4" rx="0.6" fill={TOMATO} />
      <rect x="3" y="12" width="18" height="4" rx="1" fill={PATTY} />
      <rect x="3" y="16.3" width="18" height="4.2" rx="2" fill={BUN} />
    </>
  )
}

// Same two-layer trick as PizzaIcon/TacoIcon: 'muted' is the grayscale,
// dimmed "not yet cooking" state; 'active' is full color and clips in via
// the shared `icon-fill` keyframes.
export function BurgerIcon({ variant, animationMs }: { variant: Variant; animationMs?: number }) {
  const style =
    variant === 'muted'
      ? { filter: 'grayscale(1)', opacity: 0.4 }
      : { animation: `icon-fill ${animationMs}ms ease-out forwards` }

  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" style={style}>
      <BurgerShape />
    </svg>
  )
}
