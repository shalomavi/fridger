/** Shared shadow layering for solid buttons/tabs — same top sheen + bottom
 * bevel + contact/ambient shadow pairing as Input.tsx's fieldClass, minus
 * the blur/saturate (those only do anything against a translucent
 * background, and these are solid fills). Keeps the "lifted" look
 * consistent between inputs and buttons instead of inputs alone looking
 * dimensional. */
export const elevationShadow =
  'shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.35)]'

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
 * Fixed teal (primary's actual color in both light and dark — see
 * index.css) rather than the `primary` token, since arbitrary shadow values
 * can't reference Tailwind's color-mix-based opacity utilities directly. */
export const glowShadow = 'shadow-[0_0_14px_rgba(15,118,110,0.35)]'
