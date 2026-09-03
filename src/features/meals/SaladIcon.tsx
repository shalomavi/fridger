type Variant = 'muted' | 'active'

// User-supplied illustration: a wooden bowl of lettuce, cherry tomatoes,
// cucumber, red onion, olives, and carrot slices. No gradients, so unlike
// PizzaIcon both variants can safely share one set of fills — grayscale is
// just a CSS filter on top.
// viewBox is cropped tight to the bowl's actual bounding box (the source
// art leaves a lot of empty canvas above and below it) so it fills the
// icon box at roughly the same scale as the pizza/burger.
export function SaladIcon({ variant, animationMs }: { variant: Variant; animationMs?: number }) {
  const style =
    variant === 'muted'
      ? { filter: 'grayscale(1)', opacity: 0.4 }
      : { animation: `icon-fill ${animationMs}ms linear forwards` }

  return (
    <svg viewBox="28 111 324 215" className="absolute inset-0 h-full w-full" style={style}>
      <ellipse cx="190" cy="300" rx="120" ry="14" fill="#00000014" />

      <path d="M40 190 Q40 290 190 300 Q340 290 340 190 Z" fill="#a9744f" />
      <path d="M40 190 Q40 270 190 280 Q340 270 340 190 Z" fill="#8f5f3d" />

      <ellipse cx="190" cy="188" rx="150" ry="34" fill="#c98a58" />
      <ellipse cx="190" cy="190" rx="140" ry="32" fill="#5a8f3c" />

      <path d="M75 182 Q60 158 85 148 Q95 168 110 178 Z" fill="#6faa46" />
      <path d="M110 165 Q100 136 130 130 Q135 156 150 168 Z" fill="#79b850" />
      <path d="M150 158 Q150 126 185 123 Q188 150 200 162 Z" fill="#6faa46" />
      <path d="M200 160 Q205 128 240 132 Q235 158 220 170 Z" fill="#79b850" />
      <path d="M235 170 Q250 140 280 148 Q270 170 255 180 Z" fill="#6faa46" />
      <path d="M270 180 Q292 163 305 182 Q288 192 275 192 Z" fill="#79b850" />
      <path d="M95 186 Q80 168 100 158 Q112 176 125 184 Z" fill="#89c15c" />

      <circle cx="130" cy="180" r="12" fill="#c0392b" />
      <circle cx="127" cy="177" r="3" fill="#e0685a" />
      <circle cx="215" cy="176" r="11" fill="#c0392b" />
      <circle cx="212" cy="173" r="3" fill="#e0685a" />
      <circle cx="170" cy="193" r="11" fill="#c0392b" />
      <circle cx="167" cy="190" r="3" fill="#e0685a" />
      <circle cx="250" cy="188" r="10" fill="#c0392b" />
      <circle cx="247" cy="185" r="3" fill="#e0685a" />

      <g fill="#dff0e0" stroke="#a9d3ae" strokeWidth="0.5">
        <ellipse cx="155" cy="168" rx="15" ry="6" transform="rotate(-15 155 168)" />
        <ellipse cx="195" cy="186" rx="15" ry="6" transform="rotate(10 195 186)" />
        <ellipse cx="235" cy="163" rx="14" ry="6" transform="rotate(-20 235 163)" />
      </g>
      <g fill="none" stroke="#a9d3ae" strokeWidth="0.5">
        <circle cx="155" cy="168" r="4" />
        <circle cx="195" cy="186" r="4" />
        <circle cx="235" cy="163" r="4" />
      </g>

      <g fill="#c96f9e" stroke="#a85580" strokeWidth="0.5">
        <ellipse cx="115" cy="193" rx="10" ry="5" />
        <ellipse cx="290" cy="173" rx="9" ry="5" />
        <ellipse cx="200" cy="158" rx="9" ry="4" />
      </g>

      <g stroke="#d97c1f" strokeWidth="0.5">
        <circle cx="140" cy="208" r="8" fill="#f2994a" />
        <circle cx="140" cy="208" r="3" fill="#f7b878" />
        <circle cx="225" cy="153" r="7" fill="#f2994a" />
        <circle cx="225" cy="153" r="2.7" fill="#f7b878" />
        <circle cx="278" cy="200" r="7" fill="#f2994a" />
        <circle cx="278" cy="200" r="2.7" fill="#f7b878" />
        <circle cx="105" cy="158" r="6.5" fill="#f2994a" />
        <circle cx="105" cy="158" r="2.5" fill="#f7b878" />
      </g>

      <g fill="#2f3b2a">
        <circle cx="100" cy="173" r="4" />
        <circle cx="260" cy="198" r="4" />
        <circle cx="185" cy="208" r="4" />
        <circle cx="145" cy="153" r="3.5" />
      </g>

      <ellipse cx="150" cy="186" rx="30" ry="10" fill="#f4c95d" opacity="0.35" />
    </svg>
  )
}
