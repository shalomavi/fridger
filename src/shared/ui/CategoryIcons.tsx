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
  // Traced from a downloaded reference SVG (svgrepo.com) rather than
  // hand-approximated — user-supplied source, not Lucide. This one is a
  // filled shape (bacon strips), not a stroke icon like the others here.
  return (
    <svg {...SHARED_PROPS} fill="currentColor" stroke="none" className={className}>
      <path d="M5.9,22H3a10.343,10.343,0,0,1-1-4c0-3,2-3,2-6S2,9,2,6A8.961,8.961,0,0,1,3,2H5.888A10,10,0,0,0,5,6,5.744,5.744,0,0,0,6.168,9.555,3.78,3.78,0,0,1,7,12a3.78,3.78,0,0,1-.832,2.445A5.744,5.744,0,0,0,5,18,10.908,10.908,0,0,0,5.9,22ZM7,18A9.383,9.383,0,0,0,7.9,21.554.979.979,0,0,1,7.989,22H11a10.343,10.343,0,0,1-1-4c0-3,2-3,2-6s-2-3-2-6a8.961,8.961,0,0,1,1-4H7.984a.961.961,0,0,1-.114.493A8.043,8.043,0,0,0,7,6a3.78,3.78,0,0,0,.832,2.445A5.744,5.744,0,0,1,9,12a5.744,5.744,0,0,1-1.168,3.555A3.78,3.78,0,0,0,7,18Zm9.168-8.445A5.744,5.744,0,0,1,15,6a10,10,0,0,1,.888-4H13a8.961,8.961,0,0,0-1,4c0,3,2,3,2,6s-2,3-2,6a10.343,10.343,0,0,0,1,4h2.9a10.908,10.908,0,0,1-.9-4,5.744,5.744,0,0,1,1.168-3.555A3.78,3.78,0,0,0,17,12,3.78,3.78,0,0,0,16.168,9.555ZM22,12c0-3-2-3-2-6a8.961,8.961,0,0,1,1-4H17.984a.961.961,0,0,1-.114.493A8.043,8.043,0,0,0,17,6a3.78,3.78,0,0,0,.832,2.445A5.744,5.744,0,0,1,19,12a5.744,5.744,0,0,1-1.168,3.555A3.78,3.78,0,0,0,17,18a9.383,9.383,0,0,0,.895,3.554.979.979,0,0,1,.094.446H21a10.343,10.343,0,0,1-1-4C20,15,22,15,22,12Z" />
    </svg>
  )
}

function BakeryIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M4 12.5C4 8.36 7.58 5 12 5s8 3.36 8 7.5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="m9 9.5-.7 2.5" />
      <path d="M12 8.7V12" />
      <path d="m15 9.5.7 2.5" />
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
  // Traced from a downloaded reference SVG (svgrepo.com) rather than
  // hand-approximated — user-supplied source, not Lucide.
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M12 2V18M12 22V18M12 18L15 21M12 18L9 21M15 3L12 6L9 3" />
      <path d="M3.33978 7.00042L6.80389 9.00042M6.80389 9.00042L17.1962 15.0004M6.80389 9.00042L5.70581 4.90234M6.80389 9.00042L2.70581 10.0985M17.1962 15.0004L20.6603 17.0004M17.1962 15.0004L21.2943 13.9023M17.1962 15.0004L18.2943 19.0985" />
      <path d="M20.66 7.00042L17.1959 9.00042M17.1959 9.00042L6.80364 15.0004M17.1959 9.00042L18.294 4.90234M17.1959 9.00042L21.294 10.0985M6.80364 15.0004L3.33954 17.0004M6.80364 15.0004L2.70557 13.9023M6.80364 15.0004L5.70557 19.0985" />
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
