import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  consumeItem,
  undoConsumeItem,
  listPantryItems,
  updatePantryItemDetails,
  updatePantryItemQuantity,
  updatePantryItemCategory,
  updatePantryItemExpiry,
  type PantryItem,
} from './api'
import { moveToShoppingList, undoMoveToShoppingList, type MoveResult } from './moveToShopping'
import type { Category } from '@/shared/categories'
import type { Unit } from '@/domain/units'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { itemConsumedToastContent } from '@/shared/alerts/itemConsumedToast'
import { undoAction } from '@/shared/query/undoAction'
import { itemMovedToastContent } from '@/shared/alerts/itemMovedToast'

export const pantryQueryKey = (householdId: string) => ['pantry-items', householdId] as const

export function usePantry(householdId: string) {
  const queryClient = useQueryClient()
  const key = pantryQueryKey(householdId)
  const { t } = useLanguage()
  const { notify } = useToast()
  const onMutationError = (context?: { previous?: PantryItem[] }) => {
    if (context?.previous) queryClient.setQueryData(key, context.previous)
    notify(t('actionFailed'), 'error')
  }

  const query = useQuery({ queryKey: key, queryFn: () => listPantryItems(householdId) })

  const consume = useMutation({
    mutationFn: consumeItem,
    // Optimistic: the whole point is that removing something feels as fast
    // as the swipe itself, so the list matches reality without a beat of lag.
    // cancelQueries is deliberately not awaited (here and in moveToShopping):
    // the Supabase fetch ignores abort signals, so awaiting it would hold the
    // row on screen until an in-flight poll finished its network round trip.
    onMutate: (id) => {
      void queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PantryItem[]>(key)
      queryClient.setQueryData<PantryItem[]>(key, (items) => items?.filter((i) => i.id !== id))
      const item = previous?.find((i) => i.id === id)
      if (item) {
        const { message, icon } = itemConsumedToastContent(item.name, t)
        const onUndo = () =>
          undoAction(queryClient, key, previous, () => undoConsumeItem(id), () => notify(t('actionFailed'), 'error'))
        notify(message, 'success', icon, onUndo)
      }
      return { previous }
    },
    onError: (_err, _id, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  // Not "used": the row is deleted (no consumed history) and re-created on
  // the shopping list. The shopping cache key is spelled out here because
  // importing shoppingQueryKey from useShoppingList would be a cycle.
  const moveResults = useRef(new Map<string, Promise<MoveResult>>())
  const moveToShopping = useMutation({
    mutationFn: (item: PantryItem) => {
      const result = moveToShoppingList(item)
      moveResults.current.set(item.id, result)
      return result
    },
    // Row and toast appear on tap; the write (several round trips) finishes
    // behind them. Undo waits for that write's result if it's still running.
    onMutate: (item) => {
      void queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PantryItem[]>(key)
      queryClient.setQueryData<PantryItem[]>(key, (items) => items?.filter((i) => i.id !== item.id))
      const { message, icon } = itemMovedToastContent(item.name, 'shopping-list', t)
      const onUndo = () => {
        // A failed move already rolled back and toasted; nothing left to undo.
        moveResults.current
          .get(item.id)
          ?.then((r) =>
            undoAction(
              queryClient,
              key,
              previous,
              () => undoMoveToShoppingList(item, r),
              () => notify(t('actionFailed'), 'error'),
            ),
          )
          .catch(() => {})
      }
      notify(message, 'success', icon, onUndo, '/')
      return { previous }
    },
    onError: (_err, _item, context) => onMutationError(context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: ['shopping-items', householdId] })
    },
  })

  const updateDetails = useMutation({
    mutationFn: ({ id, details }: { id: string; details: string | null }) =>
      updatePantryItemDetails(id, details),
    onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PantryItem[]>(key)
      queryClient.setQueryData<PantryItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, details } : i)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const updateQuantity = useMutation({
    mutationFn: ({ id, quantity, unit }: { id: string; quantity: number; unit: Unit }) =>
      updatePantryItemQuantity(id, quantity, unit),
    onMutate: async ({ id, quantity, unit }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PantryItem[]>(key)
      queryClient.setQueryData<PantryItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, quantity, unit } : i)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const updateCategory = useMutation({
    mutationFn: ({ id, category }: { id: string; category: Category | null }) =>
      updatePantryItemCategory(id, category),
    onMutate: async ({ id, category }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PantryItem[]>(key)
      queryClient.setQueryData<PantryItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, category } : i)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const updateExpiry = useMutation({
    mutationFn: ({ id, expiresAt }: { id: string; expiresAt: string | null }) =>
      updatePantryItemExpiry(id, expiresAt),
    onMutate: async ({ id, expiresAt }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PantryItem[]>(key)
      queryClient.setQueryData<PantryItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, expires_at: expiresAt } : i)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => onMutationError(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { ...query, consume, moveToShopping, updateDetails, updateQuantity, updateCategory, updateExpiry }
}

export function useInvalidatePantry(householdId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: pantryQueryKey(householdId) })
}
