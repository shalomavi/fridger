import type { Language } from '@/features/household/api'
import { en } from './en'
import { he } from './he'

export type { Language }

/**
 * All UI copy lives under this folder — one file per language (en.ts,
 * he.ts), no framework dependency. Auth/household-setup screens run before
 * a household (and so a language) exists, and stay English-only;
 * everything past that point reads from here via useLanguage().
 */
const dict = { en, he }

export type TKey = keyof typeof en

export function t(lang: Language, key: TKey): string {
  return dict[lang][key]
}
