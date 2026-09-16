/**
 * Cabinet with shelf dividers — simplified down from a user-supplied
 * detailed reference (a fully illustrated stocked cabinet with a bottle,
 * jar, sack, etc.) because that many interior shapes couldn't be made to
 * match every other icon's style here, only its rendered size: this file's
 * siblings (TabIcons, FormIcons, CategoryIcons) are all 1-4 simple shapes
 * on a strict viewBox="0 0 24 24" + strokeWidth 2, and the detailed version
 * stayed visibly busier/thinner-or-blobbier than that no matter how its
 * own custom viewBox/strokeWidth were tuned. This one uses the exact same
 * 24-unit grid and stroke weight instead of approximating them.
 *
 * Shared by TabIcons (nav bar), FormIcons (the moved-to-pantry toast), and
 * CategoryIcons (the pantry category tag), which all render the same
 * glyph — hence one component instead of three copies.
 */
export function PantryIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="4" y="2" width="16" height="18" rx="2" />
      <line x1="12" y1="2" x2="12" y2="20" />
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="14" x2="20" y2="14" />
      <path d="M8 20v2M16 20v2" />
    </svg>
  )
}
