// Icons: Lucide (ISC license, lucide.dev), inlined the same way as
// ThemeToggle's Sun/Moon icons — no icon library dependency.
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

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export function HashIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  )
}

export function NotesIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M21 6.1H3" />
      <path d="M17 12.1H3" />
      <path d="M13 18H3" />
    </svg>
  )
}

export function RulerIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" />
      <path d="m11.5 9.5 2-2" />
      <path d="m8.5 6.5 2-2" />
      <path d="m17.5 15.5 2-2" />
    </svg>
  )
}

export function TagIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  )
}

// Same glyphs as TabIcons' ShoppingCartIcon/PantryIcon, but at this file's
// smaller size and with a className prop — TabIcons' are fixed-size (20px,
// no className) for the nav bar specifically.
export function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}

export function PantryIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73Z" />
      <path d="M12 22V12" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <path d="m7.5 4.27 9 5.15" />
    </svg>
  )
}

// Deliberately not CheckCircleIcon: a minus reads as "used up/taken away"
// rather than "success", so a consumed-item toast doesn't look like an add.
export function CircleMinusIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </svg>
  )
}

export function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  )
}

// Was inline in DeleteButton.tsx — pulled out so the delete-toast can use
// the exact same glyph the user just tapped.
export function TrashIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="M4 7h16" />
      <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <path d="M19 7l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" />
    </svg>
  )
}

export function UnlinkIcon({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
      <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
      <line x1="8" x2="8" y1="2" y2="5" />
      <line x1="2" x2="5" y1="8" y2="8" />
      <line x1="16" x2="16" y1="19" y2="22" />
      <line x1="19" x2="22" y1="16" y2="16" />
    </svg>
  )
}
