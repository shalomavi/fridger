import { softButtonShadow } from '@/shared/ui/elevation'

// Shared by the import sheet's tab buttons and each tab's own Cancel
// button, so the two don't drift.
export const cancelButtonClass = `rounded-md bg-surface-muted px-3 py-1.5 text-sm text-text-soft transition-transform duration-300 active:scale-95 ${softButtonShadow}`
