type Variant = 'muted' | 'active'

// Same two-gradient-copy trick as PizzaIcon: 'muted' is desaturated and dim
// (the "not yet cooking" state), 'active' is full color and clips in via
// the shared `icon-fill` keyframes. Each needs its own gradient id — SVG
// ids must be unique per document, and both copies are mounted at once.
const GRADIENT_ID: Record<Variant, string> = {
  muted: 'burgerBunGradMuted',
  active: 'burgerBunGradActive',
}

// viewBox is cropped tight to the burger's actual bounding box (the source
// art sits inside a much bigger 380x320 canvas) so it fills the icon box at
// roughly the same scale as the pizza/salad instead of rendering small with
// a lot of empty margin around it — same reasoning as PizzaIcon's viewBox.
export function BurgerIcon({ variant, animationMs }: { variant: Variant; animationMs?: number }) {
  const gradientId = GRADIENT_ID[variant]
  const style =
    variant === 'muted'
      ? { filter: 'grayscale(1)', opacity: 0.4 }
      : { animation: `icon-fill ${animationMs}ms linear forwards` }

  return (
    <svg viewBox="34 58 312 238" className="absolute inset-0 h-full w-full" style={style}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8a03c" />
          <stop offset="1" stopColor="#d4841f" />
        </linearGradient>
      </defs>
      <g transform="translate(0 12)">
        <path
          d="M62 232 L318 232 Q318 266 290 268 L90 268 Q62 266 62 232 Z"
          fill={`url(#${gradientId})`}
          stroke="#c97f1e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <rect x="56" y="196" width="268" height="38" rx="18" fill="#7a4a2b" stroke="#4f2c17" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M72 206 Q190 216 308 206 Q312 210 306 214 Q190 224 74 214 Q68 210 72 206 Z" fill="#92603b" />

        <path
          d="M62 190 L318 190 L318 198 L286 198 L278 216 L268 198 L128 198 L120 212 L112 198 L62 198 Z"
          fill="#f9c72c"
          stroke="#c97f1e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <rect x="64" y="174" width="252" height="18" rx="9" fill="#c0392b" stroke="#962d22" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="120" cy="183" r="2" fill="#8f241a" />
        <circle cx="190" cy="183" r="2" fill="#8f241a" />
        <circle cx="260" cy="183" r="2" fill="#8f241a" />

        <path
          d="M54 160 Q68 182 86 168 Q102 184 118 168 Q134 184 150 168 Q166 184 182 168 Q198 184 214 168 Q230 184 246 168 Q262 184 278 168 Q294 184 312 168 Q324 178 326 160 Z"
          fill="#7cb342"
          stroke="#4e7d24"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <path
          d="M58 156 Q58 62 190 62 Q322 62 322 156 Q322 162 314 162 L66 162 Q58 162 58 156 Z"
          fill="#f2b53e"
          stroke="#c97f1e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M74 146 Q74 76 190 76 Q306 76 306 146 Q190 156 74 146 Z" fill="#f6cf6a" />

        <ellipse cx="190" cy="92" rx="6" ry="3.5" fill="#e8a03c" transform="rotate(-10 190 92)" />
        <ellipse cx="140" cy="108" rx="6" ry="3.5" fill="#e8a03c" transform="rotate(-30 140 108)" />
        <ellipse cx="240" cy="108" rx="6" ry="3.5" fill="#e8a03c" transform="rotate(30 240 108)" />
        <ellipse cx="190" cy="124" rx="6" ry="3.5" fill="#e8a03c" transform="rotate(8 190 124)" />
        <ellipse cx="112" cy="132" rx="6" ry="3.5" fill="#e8a03c" transform="rotate(-50 112 132)" />
        <ellipse cx="268" cy="132" rx="6" ry="3.5" fill="#e8a03c" transform="rotate(50 268 132)" />
        <ellipse cx="150" cy="140" rx="6" ry="3.5" fill="#e8a03c" transform="rotate(-15 150 140)" />
        <ellipse cx="230" cy="140" rx="6" ry="3.5" fill="#e8a03c" transform="rotate(15 230 140)" />
      </g>
    </svg>
  )
}
