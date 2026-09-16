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

const queryKey = (householdId: string) => ['shopping-items', householdId] as const
type AddArgs = { name: string; amount?: string; category?: Category | null }

export function useShoppingList(householdId: string) {
  const queryClient = useQueryClient()
  const key = queryKey(householdId)

  const query = useQuery({ queryKey: key, queryFn: () => listShoppingItems(householdId) })

  const addItem = useMutation({
    // Adding something already pending (typed twice, or both of you added
    // it) merges into that row instead of duplicating — domain/mergeAmount.ts.
    mutationFn: ({ name, amount, category }: AddArgs) => {
      const items = queryClient.getQueryData<ShoppingItem[]>(key)
      const existing = items?.find((i) => i.status === 'pending' && isSameIngredient(i.name, name))
      if (existing) {
        return updateShoppingItemAmount(existing.id, mergeAmount(existing.amount, amount ?? null))
      }
      return addShoppingItem(householdId, name, amount, category)
    },
    // Optimistic — without this, a new item only showed up after two round
    // trips (insert, then refetch), which read as a delayed/stuck add.
    onMutate: async ({ name, amount, category }: AddArgs) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ShoppingItem[]>(key)
      const existing = previous?.find((i) => i.status === 'pending' && isSameIngredient(i.name, name))
      queryClient.setQueryData<ShoppingItem[]>(key, (items) => {
        if (existing) {
          return items?.map((i) =>
            i.id === existing.id ? { ...i, amount: mergeAmount(i.amount, amount ?? null) } : i,
          )
        }
        const optimisticItem: ShoppingItem = {
          id: crypto.randomUUID(),
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
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const toggleItem = useMutation({
    // Checking a pending item off writes it to the pantry (§1/§3 of the
    // plan: a transition, not a move); unchecking a mis-tap undoes that.
    mutationFn: (item: ShoppingItem) =>
      item.status === 'pending' ? markPurchased(item) : undoPurchase(item),
    // Optimistic: checking an item off should feel instant, not wait on a round trip.
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ShoppingItem[]>(key)
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) =>
          i.id === item.id ? { ...i, status: i.status === 'pending' ? 'purchased' : 'pending' } : i,
        ),
      )
      return { previous }
    },
    onError: (_err, _item, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: pantryQueryKey(householdId) })
    },
  })

  const updateAmount = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: string | null }) =>
      updateShoppingItemAmount(id, amount),
    onMutate: async ({ id, amount }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ShoppingItem[]>(key)
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, amount } : i)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const updateCategory = useMutation({
    mutationFn: ({ id, category }: { id: string; category: Category | null }) =>
      updateShoppingItemCategory(id, category),
    onMutate: async ({ id, category }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ShoppingItem[]>(key)
      queryClient.setQueryData<ShoppingItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, category } : i)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const deleteItem = useMutation({
    mutationFn: (id: string) => deleteShoppingItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ShoppingItem[]>(key)
      queryClient.setQueryData<ShoppingItem[]>(key, (items) => items?.filter((i) => i.id !== id))
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { ...query, addItem, toggleItem, updateAmount, updateCategory, deleteItem }
}
