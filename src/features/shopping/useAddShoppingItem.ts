import { useRef } from 'react'
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { addShoppingItem, updateShoppingItemDetails, type ShoppingItem } from './api'
import { isSameIngredient } from '@/domain/normalize'
import { mergeDetails } from '@/domain/mergeDetails'
import type { Category } from '@/shared/categories'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { itemAddedToastContent } from '@/shared/alerts/itemAddedToast'

type AddArgs = { name: string; details?: string; category?: Category | null }

/**
 * Adding a shopping item, split out of useShoppingList to keep that file
 * under the size limit — shares its cache via the `key`/`snapshot` it's
 * given. Duplicate of a pending item merges into that row instead of adding
 * a second one — domain/mergeDetails.ts.
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
    mutationFn: ({ name, details, category }: AddArgs) => {
      const existing = pendingExisting.current
      if (existing) {
        return updateShoppingItemDetails(existing.id, mergeDetails(existing.details, details ?? null))
      }
      return addShoppingItem(householdId, pendingId.current!, name, details, category)
    },
    onMutate: async ({ name, details, category }: AddArgs) => {
      const previous = await snapshot()
      const existing = previous?.find((i) => i.status === 'pending' && isSameIngredient(i.name, name))
      pendingExisting.current = existing ?? null
      queryClient.setQueryData<ShoppingItem[]>(key, (items) => {
        if (existing) {
          return items?.map((i) =>
            i.id === existing.id ? { ...i, details: mergeDetails(i.details, details ?? null) } : i,
          )
        }
        pendingId.current = crypto.randomUUID()
        const optimisticItem: ShoppingItem = {
          id: pendingId.current,
          household_id: householdId,
          name: name.trim(),
          details: details?.trim() || null,
          category: category ?? null,
          status: 'pending',
          added_by: null,
          purchased_at: null,
          created_at: new Date().toISOString(),
        }
        return [...(items ?? []), optimisticItem]
      })
      const { message, icon } = itemAddedToastContent(existing?.category ?? category ?? null, t)
      notify(message, 'success', icon)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      notify(t('actionFailed'), 'error')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
