import type { Theme } from '@/shared/useTheme'

/** Shared "glowing teal title" look — Fridger's login title, the household
 * setup heading, and the household name in the app header all use this. */
export const titleTextClass: Record<Theme, string> = {
  light: 'text-primary',
  dark: 'text-teal-600',
}

/** Same glow shape (tight + wide drop-shadow) in both themes, but dark mode
 * needs it weaker: the same bright cyan reads as subtle against
 * light-theme's light background, but overpowers the text against
 * dark-theme's dark one — the glow's contrast against the page, not just
 * against the text, is what changes between themes. */
export const titleGlow: Record<Theme, string> = {
  light: '[filter:drop-shadow(0_0_3px_rgba(94,234,212,0.4))_drop-shadow(0_0_12px_rgba(94,234,212,0.2))]',
  dark: '[filter:drop-shadow(0_0_1.5px_rgba(94,234,212,0.3))_drop-shadow(0_0_6px_rgba(94,234,212,0.15))]',
}
