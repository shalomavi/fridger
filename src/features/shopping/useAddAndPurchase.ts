import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { addShoppingItem } from './api'
import { markPurchased } from './purchase'
import { pantryQueryKey } from '@/features/pantry/usePantry'
import type { Category } from '@/shared/categories'
import type { Unit } from '@/domain/units'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { itemMovedToastContent } from '@/shared/alerts/itemMovedToast'

export type AddAndPurchaseArgs = {
  name: string
  details?: string
  category?: Category | null
  quantity: number
  unit: Unit
}

/**
 * "Already have it" add — split out of useShoppingList to keep that file
 * under the size limit, same reasoning as useAddShoppingItem.ts. Creates the
 * shopping-list row and immediately runs the same shopping→pantry
 * transition as checking it off (purchase.ts's markPurchased), so a
 * manually-added, already-owned item still gets a checked-off history row
 * and a pantry row, exactly like the normal add-then-check flow — just in
 * one action.
 *
 * No optimistic update (unlike useAddShoppingItem): this is a rarer,
 * two-step server round trip (insert, then purchase), not worth the
 * merge-into-pending-row complexity that hook already handles.
 */
export function useAddAndPurchase(householdId: string, key: QueryKey) {
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  const { notify } = useToast()

  return useMutation({
    mutationFn: async ({ name, details, category, quantity, unit }: AddAndPurchaseArgs) => {
      const id = crypto.randomUUID()
      const trimmedName = name.trim()
      await addShoppingItem(householdId, id, trimmedName, details, category, quantity, unit)
      await markPurchased({
        id,
        household_id: householdId,
        name: trimmedName,
        details: details?.trim() || null,
        category: category ?? null,
        quantity,
        unit,
        status: 'pending',
        added_by: null,
        purchased_at: null,
        created_at: new Date().toISOString(),
      })
      return trimmedName
    },
    onSuccess: (trimmedName) => {
      const { message, icon } = itemMovedToastContent(trimmedName, 'pantry', t)
      notify(message, 'success', icon)
    },
    onError: () => notify(t('actionFailed'), 'error'),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: pantryQueryKey(householdId) })
    },
  })
}
