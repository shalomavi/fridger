import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyHousehold } from './api'

export type { Household } from './api'

export const HOUSEHOLD_QUERY_KEY = ['household'] as const

/** The caller's household. `data` is null (not undefined) once it's known they have none. */
export function useHousehold() {
  return useQuery({
    queryKey: HOUSEHOLD_QUERY_KEY,
    queryFn: getMyHousehold,
    // A household is created once, essentially never; no need to poll it.
    refetchInterval: false,
  })
}

export function useInvalidateHousehold() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: HOUSEHOLD_QUERY_KEY })
}
