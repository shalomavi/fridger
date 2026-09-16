import type { ReactNode } from 'react'
import type { TKey } from '@/shared/i18n'
import { CircleMinusIcon } from '@/shared/ui/FormIcons'

/**
 * Icon + message for the "item finished" toast — fired when a pantry item
 * is consumed. Same shape as itemAddedToast.tsx / itemMovedToast.tsx, but
 * with a minus-circle rather than the check used there: this is something
 * leaving the pantry, not a success/add. No destination icon either —
 * unlike those two, there's nowhere the item went.
 */
export function itemConsumedToastContent(
  itemName: string,
  t: (key: TKey) => string,
): { message: string; icon: ReactNode } {
  return {
    message: `${itemName} — ${t('used')}`,
    icon: <CircleMinusIcon className="text-text-muted" />,
  }
}
