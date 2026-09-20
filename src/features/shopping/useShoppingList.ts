import { useRef, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteShoppingItem,
  restoreShoppingItem,
  listShoppingItems,
  updateShoppingItemDetails,
  updateShoppingItemCategory,
  updateShoppingItemQuantity,
  type ShoppingItem,
} from './api'
import { markPurchased, undoPurchase } from './purchase'
import { useAddShoppingItem } from './useAddShoppingItem'
import { pantryQueryKey } from '@/features/pantry/usePantry'
import type { Category } from '@/shared/categories'
import type { Unit } from '@/domain/units'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { undoAction } from '@/shared/query/undoAction'
import { itemMovedToastContent } from '@/shared/alerts/itemMovedToast'
import { itemDeletedToastContent } from '@/shared/alerts/itemDeletedToast'

const queryKey = (householdId: string) => ['shopping-items', householdId] as const

export function useShoppingList(householdId: string) {
  const queryClient = useQueryClient()
  const key = queryKey(householdId)
  const { t } = useLanguage()
  const { notify } = useToast()
  const onMutationError = (context?: { previous?: ShoppingItem[] }) => {
    if (context?.previous) queryClient.setQueryData(key, context.previous)
    notify(t('actionFailed'), 'error')
  }
  const fireToast = (c: { message: string; icon: ReactNode }, onUndo?: () => void) =>
    notify(c.message, 'success', c.icon, onUndo)

  const query = useQuery({ queryKey: key, queryFn: () => listShoppingItems(householdId) })
  // Stop in-flight refetches, then snapshot for rollback — shared by every mutation's onMutate.
  async function snapshot() {
    await queryClient.cancelQueries({ queryKey: key })
    return queryClient.getQueryData<ShoppingItem[]>(key)
  }

  const addItem = useAddShoppingItem(householdId, key, snapshot)

  const pendingToggles = useRef(0)
  const toggleItem = useMutation({
    // Checking off writes to the pantry (§1/§3 of the plan: a transition, not a move); unchecking undoes that.
    // `silent` marks the re-toggle Undo fires, so that doesn't show its own toast.
    mutationFn: (item: ShoppingItem & { silent?: boolean }) =>
      item.status === 'pending' ? markPurchased(item) : undoPurchase(item),
    onMutate: async (item) => {
      pendingToggles.current += 1
      const previous = await snapshot()
      const nextStatus: ShoppingItem['status'] = item.status === 'pending' ? 'purchased' : 'pending'
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)),
      )
      if (!item.silent) {
        // Undo re-toggles: passing the post-toggle status flips it straight back the other way.
        fireToast(itemMovedToastContent(item.name, item.status === 'pending' ? 'pantry' : 'shopping-list', t), () =>
          toggleItem.mutate({ ...item, status: nextStatus, silent: true }),
        )
      }
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

  const updateQuantity = useMutation({
    mutationFn: ({ id, quantity, unit }: { id: string; quantity: number; unit: Unit }) =>
      updateShoppingItemQuantity(id, quantity, unit),
    onMutate: async ({ id, quantity, unit }) => {
      const previous = await snapshot()
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, quantity, unit } : i)),
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
      const deletedItem = previous?.find((i) => i.id === id)
      if (deletedItem) {
        const onUndo = () =>
          undoAction(queryClient, key, previous, () => restoreShoppingItem(deletedItem), () =>
            notify(t('actionFailed'), 'error'),
          )
        fireToast(itemDeletedToastContent(deletedItem.name, t), onUndo)
      }
      return { previous }
    },
    onError: (_err, _id, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { ...query, addItem, toggleItem, updateDetails, updateQuantity, updateCategory, deleteItem }
}
