export type ColorUniform = { value: Float32Array }

export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.trim().replace(/^#/, '')
  const normalized = value.length === 3 ? value.replace(/./g, (channel) => channel + channel) : value
  const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  if (!match) return [1, 1, 1]
  return [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255]
}

// Resolves an arbitrary CSS color — hex, named, or a design-token
// `var(--color-primary)` — the same way the browser would for any other
// element, so callers can hand GhostFibers a live theme token instead of a
// hardcoded hex that'd drift from src/index.css.
//
// Two steps: a probe element resolves var() against the live cascade (an
// isolated canvas has no CSS box, so it can't do that part), then a 1x1
// canvas rasterizes whatever getComputedStyle hands back. That second step
// matters because Tailwind v4's palette is defined in oklch(), which some
// browsers serialize computed `color` back out as oklch(...)/color(...)
// rather than rgb() — regex-parsing that string is fragile, but painting it
// to a canvas and reading the pixel back always yields real sRGB bytes
// regardless of the color space it was specified in.
let probe: HTMLDivElement | null = null
let ctx: CanvasRenderingContext2D | null = null

function resolveCssColor(value: string): [number, number, number] {
  if (!probe) {
    probe = document.createElement('div')
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
    document.body.appendChild(probe)
  }
  if (!ctx) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    ctx = canvas.getContext('2d')
  }
  if (!ctx) return [1, 1, 1]

  probe.style.color = value
  ctx.fillStyle = getComputedStyle(probe).color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255]
}

export function setColor(uniform: ColorUniform, cssColor: string) {
  const [r, g, b] = resolveCssColor(cssColor)
  uniform.value[0] = r
  uniform.value[1] = g
  uniform.value[2] = b
}
