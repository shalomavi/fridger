import type { Theme } from '@/shared/useTheme'

/** Shared "glowing teal title" look — Fridger's login title, the household
 * setup heading, and the household name in the app header all use this.
 *
 * Dark mode gets a dedicated brighter text shade (text-primary-accent's
 * teal-600 still reads fine, but the glow needs something brighter under it
 * to not look mismatched); light mode keeps the original token — a bright
 * teal looked out of place against light theme's light background. */
export const titleTextClass: Record<Theme, string> = {
  light: 'text-primary-accent',
  dark: 'text-teal-400',
}

/** Same glow shape (tight + wide drop-shadow) in both themes, but dark mode
 * needs it weaker: the same bright cyan reads as subtle against
 * light-theme's light background, but overpowers the text against
 * dark-theme's dark one — the glow's contrast against the page, not just
 * against the text, is what changes between themes. */
export const titleGlow: Record<Theme, string> = {
  light: '[filter:drop-shadow(0_0_6px_rgba(94,234,212,0.65))_drop-shadow(0_0_24px_rgba(94,234,212,0.4))]',
  dark: '[filter:drop-shadow(0_0_3px_rgba(94,234,212,0.5))_drop-shadow(0_0_12px_rgba(94,234,212,0.3))]',
}
