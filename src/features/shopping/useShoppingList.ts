import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addShoppingItem,
  deleteShoppingItem,
  listShoppingItems,
  markPurchased,
  undoPurchase,
  updateShoppingItemAmount,
  updateShoppingItemCategory,
  type ShoppingItem,
} from './api'
import { pantryQueryKey } from '@/features/pantry/usePantry'
import { isSameIngredient } from '@/domain/normalize'
import { mergeAmount } from '@/domain/mergeAmount'
import type { Category } from '@/shared/categories'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { itemAddedToastContent } from '@/shared/alerts/itemAddedToast'
import { itemMovedToastContent } from '@/shared/alerts/itemMovedToast'

const queryKey = (householdId: string) => ['shopping-items', householdId] as const
type AddArgs = { name: string; amount?: string; category?: Category | null }

export function useShoppingList(householdId: string) {
  const queryClient = useQueryClient()
  const key = queryKey(householdId)
  const { t } = useLanguage()
  const { notify } = useToast()
  const onMutationError = (context?: { previous?: ShoppingItem[] }) => {
    if (context?.previous) queryClient.setQueryData(key, context.previous)
    notify(t('actionFailed'), 'error')
  }

  const query = useQuery({ queryKey: key, queryFn: () => listShoppingItems(householdId) })

  // Shared by every mutation's onMutate: stop in-flight refetches, then snapshot for rollback.
  async function snapshot() {
    await queryClient.cancelQueries({ queryKey: key })
    return queryClient.getQueryData<ShoppingItem[]>(key)
  }

  // mutationFn can't re-derive these from the cache (it already holds onMutate's optimistic row).
  const pendingExisting = useRef<ShoppingItem | null>(null)
  const pendingId = useRef<string | null>(null)

  const addItem = useMutation({
    // Duplicate of a pending item merges into that row — domain/mergeAmount.ts.
    mutationFn: ({ name, amount, category }: AddArgs) => {
      const existing = pendingExisting.current
      if (existing) {
        return updateShoppingItemAmount(existing.id, mergeAmount(existing.amount, amount ?? null))
      }
      return addShoppingItem(householdId, pendingId.current!, name, amount, category)
    },
    onMutate: async ({ name, amount, category }: AddArgs) => {
      const previous = await snapshot()
      const existing = previous?.find((i) => i.status === 'pending' && isSameIngredient(i.name, name))
      pendingExisting.current = existing ?? null
      queryClient.setQueryData<ShoppingItem[]>(key, (items) => {
        if (existing) {
          return items?.map((i) =>
            i.id === existing.id ? { ...i, amount: mergeAmount(i.amount, amount ?? null) } : i,
          )
        }
        pendingId.current = crypto.randomUUID()
        const optimisticItem: ShoppingItem = {
          id: pendingId.current,
          household_id: householdId,
          name: name.trim(),
          amount: amount?.trim() || null,
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
    onError: (_err, _vars, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const toggleItem = useMutation({
    // Checking off writes to the pantry (§1/§3 of the plan: a transition, not a move); unchecking undoes that.
    mutationFn: (item: ShoppingItem) =>
      item.status === 'pending' ? markPurchased(item) : undoPurchase(item),
    onMutate: async (item) => {
      const previous = await snapshot()
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) =>
          i.id === item.id ? { ...i, status: i.status === 'pending' ? 'purchased' : 'pending' } : i,
        ),
      )
      const { message, icon } = itemMovedToastContent(item.status === 'pending' ? 'pantry' : 'shopping-list', t)
      notify(message, 'success', icon)
      return { previous }
    },
    onError: (_err, _item, context) => onMutationError(context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: pantryQueryKey(householdId) })
    },
  })

  const updateAmount = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: string | null }) =>
      updateShoppingItemAmount(id, amount),
    onMutate: async ({ id, amount }) => {
      const previous = await snapshot()
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, amount } : i)),
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
      return { previous }
    },
    onError: (_err, _id, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { ...query, addItem, toggleItem, updateAmount, updateCategory, deleteItem }
}
