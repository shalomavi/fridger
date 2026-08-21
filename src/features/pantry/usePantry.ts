import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listPantryItems } from './api'

export const pantryQueryKey = (householdId: string) => ['pantry-items', householdId] as const

export function usePantry(householdId: string) {
  return useQuery({
    queryKey: pantryQueryKey(householdId),
    queryFn: () => listPantryItems(householdId),
  })
}

export function useInvalidatePantry(householdId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: pantryQueryKey(householdId) })
}
