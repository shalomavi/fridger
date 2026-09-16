import type { ReactNode } from 'react'
import type { TKey } from '@/shared/i18n'
import { TrashIcon } from '@/shared/ui/FormIcons'

/**
 * Icon + message for the "item deleted" toast — same shape as the other
 * item-action toasts (itemAddedToast.tsx etc.), with DeleteButton's own
 * trash glyph so the toast echoes the icon the user just tapped.
 */
export function itemDeletedToastContent(
  itemName: string,
  t: (key: TKey) => string,
): { message: string; icon: ReactNode } {
  return {
    message: `${itemName} — ${t('deleted')}`,
    icon: <TrashIcon className="text-danger" />,
  }
}
