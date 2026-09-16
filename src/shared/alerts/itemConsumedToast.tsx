import type { ReactNode } from 'react'
import type { TKey } from '@/shared/i18n'
import { CheckCircleIcon } from '@/shared/ui/FormIcons'

/**
 * Icon + message for the "item finished" toast — fired when a pantry item
 * is consumed. Same shape as itemAddedToast.tsx / itemMovedToast.tsx: a
 * success check next to what happened. No destination icon here — unlike
 * those two, there's nowhere the item went.
 */
export function itemConsumedToastContent(
  itemName: string,
  t: (key: TKey) => string,
): { message: string; icon: ReactNode } {
  return {
    message: `${itemName} — ${t('used')}`,
    icon: <CheckCircleIcon className="text-primary" />,
  }
}
