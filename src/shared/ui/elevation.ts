import type { Theme } from '@/shared/useTheme'

/** Shared shadow layering for the nav tab bar specifically — top sheen +
 * bottom bevel + contact/ambient shadow pairing as Input.tsx's fieldClass,
 * minus the blur/saturate (those only do anything against a translucent
 * background, and these are solid fills). Keeps the "lifted" look
 * consistent between inputs and the nav instead of inputs alone looking
 * dimensional. Everything else that wants this "lifted surface" look
 * (Button, MealTypeSettings chips, LanguageToggle/ThemeToggle) uses
 * buttonShadow below instead — same bottom/contact/ambient shadows, no top
 * sheen. */
export const elevationShadow =
  'shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.35)]'

/** elevationShadow without the top sheen — see the note above. */
export const buttonShadow =
  'shadow-[inset_0_-2px_0_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.35)]'

/** The outward-cast contact + ambient pair, eased down and spread wider
 * instead of just dimmed, so the shadow fades out softly past an element's
 * edge rather than stopping abruptly. Composed with each caller's own inset
 * bevel below — that inset is left alone since it reads as part of the
 * element itself, not something "going out" of it. */
const softOuterShadow = '0_2px_5px_rgba(0,0,0,0.2),0_10px_24px_rgba(0,0,0,0.24)'

/** buttonShadow with softOuterShadow — Button.tsx's own variants
 * specifically; nav tabs/toggles/chips keep plain buttonShadow. */
export const softButtonShadow = `shadow-[inset_0_-2px_0_rgba(0,0,0,0.25),${softOuterShadow}]`

/** Input.tsx's fieldClass shadow (resting and focus) with softOuterShadow
 * in place of its original heavier contact/ambient pair — same softening as
 * softButtonShadow, kept as its own export since fields use a deeper inset
 * (0.35, vs. buttons' 0.25) and add the focus ring layer on top. */
export const softFieldShadow = `inset_0_-2px_0_rgba(0,0,0,0.35),${softOuterShadow}`

/** elevationShadow, but for *inactive* bg-surface elements (inactive nav
 * tabs, unselected MealTypeSettings chips) in light theme specifically: the
 * white top sheen has nothing to contrast against on bg-surface's plain
 * white fill there, so it's swapped for a soft dark inset instead — a
 * shadow, not a border, to match the rest of the app's shadow-based depth
 * rather than a hard line. Dark theme keeps plain elevationShadow
 * unchanged, since bg-surface is a dark slate there and the white sheen
 * already shows fine. */
export const inactiveElevationShadow: Record<Theme, string> = {
  light:
    'shadow-[inset_0_2px_0_rgba(0,0,0,0.2),inset_0_-2px_0_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.35)]',
  dark: elevationShadow,
}

/** The inverse of elevationShadow, for a segment of a control (e.g. the
 * selected side of LanguageToggle/ThemeToggle) that should read as pressed
 * in rather than lifted off the page — shadow falling inward from the top,
 * like it's recessed into the surface next to it, instead of casting a
 * shadow outward. No bottom highlight (nothing is "lifting" it), so it
 * reads as the opposite state of a raised button rather than just a darker
 * version of one. */
export const pressedShadow = 'shadow-[inset_0_3px_6px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(0,0,0,0.3)]'

/** A soft ambient halo, for list rows (ShoppingRow/PantryRow) rather than
 * controls — no offset and a wide blur, so it reads as a glow surrounding
 * the item rather than a shadow cast in one direction like elevationShadow.
 * color-mix against --color-primary (index.css) directly, rather than a
 * hardcoded teal rgba, so the glow follows the token if it's ever
 * retheme'd instead of silently going stale. */
export const glowShadow = 'shadow-[0_0_14px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]'
