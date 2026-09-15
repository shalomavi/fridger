import type { Category } from '@/shared/categories'

// Icons: Lucide (ISC license, lucide.dev), inlined the same way as
// ThemeToggle's Sun/Moon icons — no icon library dependency. A couple
// (bakery, frozen) are simplified/approximate rather than pixel-exact Lucide
// glyphs, since Lucide has no bread or snowflake icon that reads clearly at
// this size.
const SHARED_PROPS = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function DairyIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M9 3h6" />
      <path d="M9 3v4.5L6 13v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7l-3-5.5V3" />
    </svg>
  )
}

function ProduceIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

function MeatIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function BakeryIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M4 13c0-4 3.5-7 8-7s8 3 8 7-3.5 6-8 6-8-2-8-6Z" />
      <path d="M5 13h14" />
    </svg>
  )
}

function PantryIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73Z" />
      <path d="M12 22V12" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <path d="m7.5 4.27 9 5.15" />
    </svg>
  )
}

function FrozenIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M12 2v20" />
      <path d="M4.5 6.5 19.5 17.5" />
      <path d="M19.5 6.5 4.5 17.5" />
    </svg>
  )
}

function BeveragesIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  )
}

function SnacksIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  )
}

function HouseholdIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

function HygieneIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M12 2.69 17.66 8.35a8 8 0 1 1-11.32 0Z" />
    </svg>
  )
}

function OtherIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

export const CATEGORY_ICONS: Record<Category, (props: { className?: string }) => React.JSX.Element> = {
  dairy: DairyIcon,
  produce: ProduceIcon,
  meat: MeatIcon,
  bakery: BakeryIcon,
  pantry: PantryIcon,
  frozen: FrozenIcon,
  beverages: BeveragesIcon,
  snacks: SnacksIcon,
  household: HouseholdIcon,
  hygiene: HygieneIcon,
  other: OtherIcon,
}
