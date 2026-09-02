import { useEffect, useState } from 'react'

type Kind = 'pizza' | 'burger' | 'rice'

const ICONS: Kind[] = ['pizza', 'burger', 'rice']
const STEP_MS = 1100

// Accent color each icon fills with once it's "cooking" — the base layer
// underneath always renders muted/gray via text-text-subtle.
const ACCENT: Record<Kind, string> = {
  pizza: '#f97316', // crust/cheese orange
  burger: '#a16207', // bun/patty brown
  rice: '#14b8a6', // bowl teal, matches --color-primary-accent
}

function IconShape({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'pizza':
      return (
        <>
          <path d="M12 2 21.5 20H2.5Z" />
          <circle cx="11" cy="12" r="1.1" fill="var(--color-bg)" />
          <circle cx="14.5" cy="15.5" r="1.1" fill="var(--color-bg)" />
          <circle cx="9.5" cy="16.5" r="1.1" fill="var(--color-bg)" />
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
    case 'rice':
      return (
        <>
          <path d="M4 11.5h16l-1.6 8.1a2 2 0 0 1-2 1.6H7.6a2 2 0 0 1-2-1.6Z" />
          <ellipse cx="12" cy="11.3" rx="8" ry="2.1" />
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
 * suggestions: a pizza, burger, and rice bowl take turns filling with
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
