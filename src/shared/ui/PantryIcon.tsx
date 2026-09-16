/**
 * Traced from a user-supplied reference image of a stocked pantry cabinet.
 * Shared by TabIcons (nav bar), FormIcons (the moved-to-pantry toast), and
 * CategoryIcons (the pantry category tag) — all three rendered the exact
 * same glyph before, so it lives here once instead of duplicated three
 * times at this size.
 */
export function PantryIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 500 500" aria-hidden className={className}>
      <g fill="none" stroke="currentColor" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round">
        <rect x="75" y="75" width="350" height="350" rx="35" />

        <path d="M 125 425 L 125 450 M 375 425 L 375 450" />
        <path d="M 105 450 L 395 450" />

        <line x1="75" y1="190" x2="425" y2="190" />
        <line x1="75" y1="305" x2="425" y2="305" />
        <line x1="250" y1="75" x2="250" y2="425" />

        <rect x="135" y="125" width="55" height="30" rx="5" />
        <rect x="145" y="105" width="35" height="20" rx="3" />

        <path d="M 315 155 Q 330 120 345 155 Z" />
        <path d="M 365 130 C 375 110, 400 120, 395 145" />

        <rect x="175" y="240" width="45" height="50" rx="8" />
        <circle cx="205" cy="265" r="5" fill="currentColor" />
        <path d="M 105 285 L 105 250 Q 120 235 135 250 L 135 285 Z" />

        <circle cx="275" cy="245" r="8" fill="currentColor" />
        <rect x="315" y="250" width="30" height="40" rx="5" />
        <rect x="360" y="250" width="30" height="40" rx="5" />

        <path d="M 125 385 C 125 345, 195 345, 195 385 Z" />
        <path d="M 145 345 Q 160 330 175 345" />
        <path d="M 145 395 C 145 385, 175 385, 175 395" />

        <circle cx="330" cy="370" r="18" />
        <path d="M 330 352 Q 340 340 345 350" />
        <circle cx="375" cy="375" r="10" />
        <circle cx="390" cy="385" r="10" />
        <circle cx="380" cy="395" r="10" />
      </g>
    </svg>
  )
}
