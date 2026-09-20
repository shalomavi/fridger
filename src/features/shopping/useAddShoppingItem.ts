import { useRef } from 'react'
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import {
  addShoppingItem,
  deleteShoppingItem,
  updateShoppingItemDetailsAndQuantity,
  type ShoppingItem,
} from './api'
import { isSameIngredient } from '@/domain/normalize'
import { mergeDetails } from '@/domain/mergeDetails'
import { mergeQuantity } from '@/domain/mergeQuantity'
import { sameUnitGroup, type Unit } from '@/domain/units'
import type { Category } from '@/shared/categories'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { undoAction } from '@/shared/query/undoAction'
import { itemAddedToastContent } from '@/shared/alerts/itemAddedToast'

type AddArgs = { name: string; details?: string; category?: Category | null; quantity: number; unit: Unit }

/**
 * Adding a shopping item, split out of useShoppingList to keep that file
 * under the size limit — shares its cache via the `key`/`snapshot` it's
 * given. Duplicate of a pending item merges into that row instead of adding
 * a second one — domain/mergeDetails.ts, domain/mergeQuantity.ts. A
 * duplicate whose unit isn't compatible with the existing row's (kg vs ml)
 * is treated as not the same row, so it adds a second one instead.
 */
export function useAddShoppingItem(
  householdId: string,
  key: QueryKey,
  snapshot: () => Promise<ShoppingItem[] | undefined>,
) {
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  const { notify } = useToast()
  // mutationFn can't re-derive these from the cache (it already holds onMutate's optimistic row).
  const pendingExisting = useRef<ShoppingItem | null>(null)
  const pendingId = useRef<string | null>(null)

  return useMutation({
    mutationFn: ({ name, details, category, quantity, unit }: AddArgs) => {
      const existing = pendingExisting.current
      if (existing) {
        const merged = mergeQuantity({ quantity: existing.quantity, unit: existing.unit }, { quantity, unit })!
        return updateShoppingItemDetailsAndQuantity(
          existing.id,
          mergeDetails(existing.details, details ?? null),
          merged.quantity,
          merged.unit,
        )
      }
      return addShoppingItem(householdId, pendingId.current!, name, details, category, quantity, unit)
    },
    onMutate: async ({ name, details, category, quantity, unit }: AddArgs) => {
      const previous = await snapshot()
      const existing = previous?.find(
        (i) => i.status === 'pending' && isSameIngredient(i.name, name) && sameUnitGroup(i.unit, unit),
      )
      pendingExisting.current = existing ?? null
      queryClient.setQueryData<ShoppingItem[]>(key, (items) => {
        if (existing) {
          const merged = mergeQuantity({ quantity: existing.quantity, unit: existing.unit }, { quantity, unit })!
          return items?.map((i) =>
            i.id === existing.id
              ? { ...i, details: mergeDetails(i.details, details ?? null), quantity: merged.quantity, unit: merged.unit }
              : i,
          )
        }
        pendingId.current = crypto.randomUUID()
        const optimisticItem: ShoppingItem = {
          id: pendingId.current,
          household_id: householdId,
          name: name.trim(),
          details: details?.trim() || null,
          category: category ?? null,
          quantity,
          unit,
          status: 'pending',
          added_by: null,
          purchased_at: null,
          created_at: new Date().toISOString(),
        }
        return [...(items ?? []), optimisticItem]
      })
      const { message, icon } = itemAddedToastContent(existing?.category ?? category ?? null, t)
      // Undo: a genuinely new row gets deleted; a merge-into-a-duplicate
      // instead restores that row's pre-merge details/quantity rather than
      // deleting it outright, since it existed before this add.
      const newId = existing ? null : pendingId.current
      const onUndo = () =>
        undoAction(
          queryClient,
          key,
          previous,
          () =>
            existing
              ? updateShoppingItemDetailsAndQuantity(existing.id, existing.details, existing.quantity, existing.unit)
              : deleteShoppingItem(newId!),
          () => notify(t('actionFailed'), 'error'),
        )
      notify(message, 'success', icon, onUndo)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      notify(t('actionFailed'), 'error')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
