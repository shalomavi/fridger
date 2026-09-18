import type { ReactNode } from 'react'
import type { TKey } from '@/shared/i18n'
import { CheckCircleIcon, PantryIcon, ShoppingCartIcon } from '@/shared/ui/FormIcons'

export type MoveDestination = 'pantry' | 'shopping-list'

const DESTINATION_ICON = {
  pantry: PantryIcon,
  'shopping-list': ShoppingCartIcon,
} satisfies Record<MoveDestination, (props: { className?: string }) => React.JSX.Element>

const DESTINATION_KEY = {
  pantry: 'movedToPantry',
  'shopping-list': 'movedToShoppingList',
} satisfies Record<MoveDestination, TKey>

/**
 * Icon + message for a "moved to X" toast (shopping list <-> pantry) — same
 * shape as itemAddedToast.tsx, a lookup table instead of a category. A
 * future third destination is a new MoveDestination plus one entry in each
 * table above; nothing else here changes.
 *
 * The message is prefixed with the item name (like itemConsumedToast /
 * itemDeletedToast) so moving several different items in a row doesn't
 * collapse into one toast — ToastContext dedupes by exact message string.
 */
export function itemMovedToastContent(
  itemName: string,
  destination: MoveDestination,
  t: (key: TKey) => string,
): { message: string; icon: ReactNode } {
  const DestinationIcon = DESTINATION_ICON[destination]
  return {
    message: `${itemName} — ${t(DESTINATION_KEY[destination])}`,
    icon: (
      <span className="flex items-center gap-1">
        <CheckCircleIcon className="text-primary" />
        <DestinationIcon className="text-text-muted" />
      </span>
    ),
  }
}
