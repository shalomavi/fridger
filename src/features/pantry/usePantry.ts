import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { consumeItem, listPantryItems, updatePantryItemAmount, type PantryItem } from './api'

export const pantryQueryKey = (householdId: string) => ['pantry-items', householdId] as const

export function usePantry(householdId: string) {
  const queryClient = useQueryClient()
  const key = pantryQueryKey(householdId)

  const query = useQuery({ queryKey: key, queryFn: () => listPantryItems(householdId) })

  const consume = useMutation({
    mutationFn: consumeItem,
    // Optimistic: the whole point is that removing something feels as fast
    // as the swipe itself, so the list matches reality without a beat of lag.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PantryItem[]>(key)
      queryClient.setQueryData<PantryItem[]>(key, (items) => items?.filter((i) => i.id !== id))
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const updateAmount = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: string | null }) =>
      updatePantryItemAmount(id, amount),
    onMutate: async ({ id, amount }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PantryItem[]>(key)
      queryClient.setQueryData<PantryItem[]>(key, (items) =>
        items?.map((i) => (i.id === id ? { ...i, amount } : i)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return { ...query, consume, updateAmount }
}

export function useInvalidatePantry(householdId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: pantryQueryKey(householdId) })
}
