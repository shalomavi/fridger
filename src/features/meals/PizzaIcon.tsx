type Variant = 'muted' | 'active'

// Two copies of the same detailed pizza render side by side in MealLoader:
// 'muted' is desaturated and dim (the "not yet cooking" state), 'active' is
// full color and clips in via the shared `icon-fill` keyframes. Each needs
// its own gradient id — SVG ids must be unique per document, and both
// copies are mounted at once.
const GRADIENT_ID: Record<Variant, string> = {
  muted: 'pizzaCrustGradMuted',
  active: 'pizzaCrustGradActive',
}

export function PizzaIcon({ variant, animationMs }: { variant: Variant; animationMs?: number }) {
  const gradientId = GRADIENT_ID[variant]
  const style =
    variant === 'muted'
      ? { filter: 'grayscale(1)', opacity: 0.4 }
      : { animation: `icon-fill ${animationMs}ms ease-out forwards` }

  return (
    <svg viewBox="0 0 460 460" className="absolute inset-0 h-full w-full" style={style}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8a03c" />
          <stop offset="1" stopColor="#d4841f" />
        </linearGradient>
      </defs>
      <g transform="translate(38 43) rotate(140 190 185)">
        <path
          d="M181 46 Q190 38 199 46 L335 291 Q340 300 331 305 Q190 333 49 305 Q40 300 45 291 Z"
          fill="#f2b53e"
          stroke="#c97f1e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M182 48 Q190 41 198 48 L323 271 Q328 278 320 281 Q190 303 60 281 Q52 278 57 271 Z" fill="#f6cf6a" />

        <circle cx="230" cy="150" r="4" fill="#e8a03c" />
        <circle cx="170" cy="200" r="4" fill="#e8a03c" />
        <circle cx="260" cy="220" r="4" fill="#e8a03c" />
        <circle cx="130" cy="230" r="4" fill="#e8a03c" />
        <circle cx="200" cy="90" r="3.5" fill="#e8a03c" />

        <circle cx="172" cy="122" r="15" fill="#c0392b" stroke="#962d22" strokeWidth="1" />
        <circle cx="167" cy="117" r="2" fill="#8f241a" />
        <circle cx="177" cy="124" r="2" fill="#8f241a" />
        <circle cx="170" cy="128" r="1.5" fill="#8f241a" />

        <circle cx="215" cy="175" r="16" fill="#c0392b" stroke="#962d22" strokeWidth="1" />
        <circle cx="210" cy="170" r="2" fill="#8f241a" />
        <circle cx="220" cy="177" r="2" fill="#8f241a" />
        <circle cx="213" cy="181" r="1.5" fill="#8f241a" />

        <circle cx="170" cy="245" r="16" fill="#c0392b" stroke="#962d22" strokeWidth="1" />
        <circle cx="165" cy="240" r="2" fill="#8f241a" />
        <circle cx="175" cy="247" r="2" fill="#8f241a" />
        <circle cx="168" cy="251" r="1.5" fill="#8f241a" />

        <circle cx="212" cy="120" r="13" fill="#c0392b" stroke="#962d22" strokeWidth="1" />
        <circle cx="208" cy="116" r="1.6" fill="#8f241a" />
        <circle cx="216" cy="122" r="1.6" fill="#8f241a" />

        <circle cx="130" cy="185" r="13" fill="#c0392b" stroke="#962d22" strokeWidth="1" />
        <circle cx="126" cy="181" r="1.6" fill="#8f241a" />
        <circle cx="134" cy="187" r="1.6" fill="#8f241a" />

        <path
          d="M60 281 Q190 303 320 281 L331 305 Q190 333 49 305 Q40 300 45 291 L57 271 Q52 278 60 281 Z"
          fill={`url(#${gradientId})`}
          stroke="#c97f1e"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
