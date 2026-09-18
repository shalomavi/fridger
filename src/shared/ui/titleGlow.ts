import type { Theme } from '@/shared/useTheme'

/** Shared "glowing teal title" look — Fridger's login title, the household
 * setup heading, and the household name in the app header all use this. */
export const titleTextClass: Record<Theme, string> = {
  light: 'text-primary-accent',
  dark: 'text-teal-500',
}

/** Same glow shape (tight + wide drop-shadow) in both themes, but dark mode
 * needs it weaker: the same bright cyan reads as subtle against
 * light-theme's light background, but overpowers the text against
 * dark-theme's dark one — the glow's contrast against the page, not just
 * against the text, is what changes between themes. */
export const titleGlow: Record<Theme, string> = {
  light: '[filter:drop-shadow(0_0_4px_rgba(94,234,212,0.5))_drop-shadow(0_0_14px_rgba(94,234,212,0.25))]',
  dark: '[filter:drop-shadow(0_0_2px_rgba(94,234,212,0.38))_drop-shadow(0_0_7px_rgba(94,234,212,0.2))]',
}
