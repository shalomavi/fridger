/** Shared shadow layering for solid buttons/tabs — same top sheen + bottom
 * bevel + contact/ambient shadow pairing as Input.tsx's fieldClass, minus
 * the blur/saturate (those only do anything against a translucent
 * background, and these are solid fills). Keeps the "lifted" look
 * consistent between inputs and buttons instead of inputs alone looking
 * dimensional. */
export const elevationShadow =
  'shadow-[inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.35)]'
