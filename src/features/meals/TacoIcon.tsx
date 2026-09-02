type Variant = 'muted' | 'active'

// Same two-layer trick as PizzaIcon, but the artwork itself (public/taco.png)
// is loaded as an <img> rather than inlined — it's a photo-quality trace, too
// big to embed as JSX. It's a PNG rather than the original SVG because that
// SVG built its background from color layers shared with the shell's own
// shading (a posterized/quantized trace, not clean subject/background
// layers), so removing the background couldn't be done by dropping colors —
// it was cut out spatially from a render instead.
// object-cover (not object-contain): the source photo is wider than tall,
// and contain would letterbox it, making the taco visibly shorter than the
// square pizza/burger artwork in the same box. Cover crops the sides
// instead, keeping its height consistent with the other two icons.
export function TacoIcon({ variant, animationMs }: { variant: Variant; animationMs?: number }) {
  const style =
    variant === 'muted'
      ? { filter: 'grayscale(1)', opacity: 0.4 }
      : { animation: `icon-fill ${animationMs}ms linear forwards` }

  return (
    <img
      src="/taco.png"
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      style={style}
    />
  )
}
