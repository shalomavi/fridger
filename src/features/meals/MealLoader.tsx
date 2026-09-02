import { useEffect, useState } from 'react'

type Kind = 'pizza' | 'burger' | 'taco'

const ICONS: Kind[] = ['pizza', 'burger', 'taco']
const STEP_MS = 1100

// Accent color each icon fills with once it's "cooking" — the base layer
// underneath always renders muted/gray via text-text-subtle.
const ACCENT: Record<Kind, string> = {
  pizza: '#f97316', // crust/cheese orange
  burger: '#a16207', // bun/patty brown
  taco: '#dc2626', // tomato/salsa red
}

function IconShape({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'pizza':
      return (
        <>
          {/* clean triangular slice */}
          <path d="M12 2 21.5 20H2.5Z" />
          {/* crust rim */}
          <path
            d="M4.6 15.6 19.4 15.6"
            stroke="var(--color-bg)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="0.5 2.6"
          />
          {/* pepperoni + a basil leaf, punched out as holes */}
          <circle cx="11" cy="8.5" r="1" fill="var(--color-bg)" />
          <circle cx="14.5" cy="11" r="1" fill="var(--color-bg)" />
          <circle cx="9" cy="12.5" r="1" fill="var(--color-bg)" />
          <circle cx="13" cy="14.7" r="1" fill="var(--color-bg)" />
          <ellipse cx="10.2" cy="16.8" rx="1.3" ry="0.7" fill="var(--color-bg)" transform="rotate(-25 10.2 16.8)" />
        </>
      )
    case 'burger':
      return (
        <>
          <path d="M3 8a2 2 0 0 1 2-2c1-2.2 3.2-4 7-4s6 1.8 7 4a2 2 0 0 1 2 2Z" />
          <rect x="3" y="10.5" width="18" height="2.6" rx="1.3" />
          <rect x="3" y="14.5" width="18" height="4.5" rx="2.25" />
        </>
      )
    case 'taco':
      return (
        <>
          {/* shell: a flat-topped half circle */}
          <path d="M3 12A9 9 0 0 0 21 12Z" />
          {/* filling spilling over the shell's flat rim, jagged like lettuce */}
          <path d="M3 12 5 8 7 10.5 9 7 11 10.5 13 7 15 10.5 17 7 19 10.5 21 8 21 12Z" />
          {/* tomato + onion bits, punched out as holes */}
          <circle cx="9" cy="15" r="1" fill="var(--color-bg)" />
          <circle cx="15" cy="14.5" r="1" fill="var(--color-bg)" />
          <circle cx="12" cy="17.5" r="1" fill="var(--color-bg)" />
        </>
      )
  }
}

/** One food icon: a muted base silhouette with a colored layer that fills
 * in over it, restarted (via the `key` the parent gives each icon) every
 * time it becomes the active one in the rotation. */
function FoodIcon({ kind }: { kind: Kind }) {
  return (
    <div className="relative h-8 w-8" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full text-text-subtle opacity-40">
        <IconShape kind={kind} />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill={ACCENT[kind]}
        className="absolute inset-0 h-full w-full"
        style={{ animation: `icon-fill ${STEP_MS}ms ease-out forwards` }}
      >
        <IconShape kind={kind} />
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
