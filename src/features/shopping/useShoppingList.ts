import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addShoppingItem, listShoppingItems, setShoppingItemStatus, type ShoppingItem } from './api'

const queryKey = (householdId: string) => ['shopping-items', householdId] as const

export function useShoppingList(householdId: string) {
  const queryClient = useQueryClient()
  const key = queryKey(householdId)

  const query = useQuery({ queryKey: key, queryFn: () => listShoppingItems(householdId) })

  const addItem = useMutation({
    mutationFn: (name: string) => addShoppingItem(householdId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const toggleItem = useMutation({
    mutationFn: (item: ShoppingItem) =>
      setShoppingItemStatus(item.id, item.status === 'pending' ? 'purchased' : 'pending'),
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { ...query, addItem, toggleItem }
}
