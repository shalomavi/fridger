type Variant = 'muted' | 'active'

// Same two-layer trick as PizzaIcon, but the artwork itself (public/taco.svg,
// the beige background stripped out) is loaded as an <img> rather than
// inlined — it's a dense photorealistic trace, too big to embed as JSX
// without bloating the JS bundle.
export function TacoIcon({ variant, animationMs }: { variant: Variant; animationMs?: number }) {
  const style =
    variant === 'muted'
      ? { filter: 'grayscale(1)', opacity: 0.4 }
      : { animation: `icon-fill ${animationMs}ms ease-out forwards` }

  return (
    <img
      src="/taco.svg"
      alt=""
      className="absolute inset-0 h-full w-full object-contain"
      style={style}
    />
  )
}
