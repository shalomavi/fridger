import { useRef, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addShoppingItem,
  deleteShoppingItem,
  listShoppingItems,
  markPurchased,
  undoPurchase,
  updateShoppingItemDetails,
  updateShoppingItemCategory,
  type ShoppingItem,
} from './api'
import { pantryQueryKey } from '@/features/pantry/usePantry'
import { isSameIngredient } from '@/domain/normalize'
import { mergeDetails } from '@/domain/mergeDetails'
import type { Category } from '@/shared/categories'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { itemAddedToastContent } from '@/shared/alerts/itemAddedToast'
import { itemMovedToastContent } from '@/shared/alerts/itemMovedToast'
import { itemDeletedToastContent } from '@/shared/alerts/itemDeletedToast'

const queryKey = (householdId: string) => ['shopping-items', householdId] as const
type AddArgs = { name: string; details?: string; category?: Category | null }

export function useShoppingList(householdId: string) {
  const queryClient = useQueryClient()
  const key = queryKey(householdId)
  const { t } = useLanguage()
  const { notify } = useToast()
  const onMutationError = (context?: { previous?: ShoppingItem[] }) => {
    if (context?.previous) queryClient.setQueryData(key, context.previous)
    notify(t('actionFailed'), 'error')
  }
  const fireToast = (c: { message: string; icon: ReactNode }) => notify(c.message, 'success', c.icon)

  const query = useQuery({ queryKey: key, queryFn: () => listShoppingItems(householdId) })
  // Stop in-flight refetches, then snapshot for rollback — shared by every mutation's onMutate.
  async function snapshot() {
    await queryClient.cancelQueries({ queryKey: key })
    return queryClient.getQueryData<ShoppingItem[]>(key)
  }
  // mutationFn can't re-derive these from the cache (it already holds onMutate's optimistic row).
  const pendingExisting = useRef<ShoppingItem | null>(null)
  const pendingId = useRef<string | null>(null)

  const addItem = useMutation({
    // Duplicate of a pending item merges into that row — domain/mergeDetails.ts.
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
      fireToast(itemAddedToastContent(existing?.category ?? category ?? null, t))
      return { previous }
    },
    onError: (_err, _vars, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const pendingToggles = useRef(0)
  const toggleItem = useMutation({
    // Checking off writes to the pantry (§1/§3 of the plan: a transition, not a move); unchecking undoes that.
    mutationFn: (item: ShoppingItem) =>
      item.status === 'pending' ? markPurchased(item) : undoPurchase(item),
    onMutate: async (item) => {
      pendingToggles.current += 1
      const previous = await snapshot()
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) =>
          i.id === item.id ? { ...i, status: i.status === 'pending' ? 'purchased' : 'pending' } : i,
        ),
      )
      fireToast(itemMovedToastContent(item.status === 'pending' ? 'pantry' : 'shopping-list', t))
      return { previous }
    },
    onError: (_err, _item, context) => onMutationError(context),
    // Refetching mid-sibling-toggle would overwrite its optimistic row, then blink it back on settle.
    onSettled: () => {
      if (--pendingToggles.current > 0) return
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: pantryQueryKey(householdId) })
    },
  })

  const updateDetails = useMutation({
    mutationFn: ({ id, details }: { id: string; details: string | null }) =>
      updateShoppingItemDetails(id, details),
    onMutate: async ({ id, details }) => {
      const previous = await snapshot()
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, details } : i)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const updateCategory = useMutation({
    mutationFn: ({ id, category }: { id: string; category: Category | null }) =>
      updateShoppingItemCategory(id, category),
    onMutate: async ({ id, category }) => {
      const previous = await snapshot()
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, category } : i)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const deleteItem = useMutation({
    mutationFn: (id: string) => deleteShoppingItem(id),
    onMutate: async (id) => {
      const previous = await snapshot()
      queryClient.setQueryData<ShoppingItem[]>(key, (items) => items?.filter((i) => i.id !== id))
      const deletedName = previous?.find((i) => i.id === id)?.name
      if (deletedName) fireToast(itemDeletedToastContent(deletedName, t))
      return { previous }
    },
    onError: (_err, _id, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { ...query, addItem, toggleItem, updateDetails, updateCategory, deleteItem }
}
