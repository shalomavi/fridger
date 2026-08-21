import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addShoppingItem,
  listShoppingItems,
  markPurchased,
  undoPurchase,
  updateShoppingItemAmount,
  type ShoppingItem,
} from './api'
import { pantryQueryKey } from '@/features/pantry/usePantry'
import { isSameIngredient } from '@/domain/normalize'
import { mergeAmount } from '@/domain/mergeAmount'

const queryKey = (householdId: string) => ['shopping-items', householdId] as const

export function useShoppingList(householdId: string) {
  const queryClient = useQueryClient()
  const key = queryKey(householdId)

  const query = useQuery({ queryKey: key, queryFn: () => listShoppingItems(householdId) })

  const addItem = useMutation({
    // Adding something already on the pending list (someone typed "milk"
    // twice, or both of you added it) merges into that row instead of
    // creating a duplicate — see domain/mergeAmount.ts.
    mutationFn: ({ name, amount }: { name: string; amount?: string }) => {
      const items = queryClient.getQueryData<ShoppingItem[]>(key)
      const existing = items?.find((i) => i.status === 'pending' && isSameIngredient(i.name, name))
      if (existing) {
        return updateShoppingItemAmount(existing.id, mergeAmount(existing.amount, amount ?? null))
      }
      return addShoppingItem(householdId, name, amount)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
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

  return { ...query, addItem, toggleItem, updateAmount }
}
