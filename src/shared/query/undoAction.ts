import type { QueryClient, QueryKey } from '@tanstack/react-query'

/**
 * Shared "Undo" pattern for a toast action: put the pre-mutation snapshot
 * back in the cache immediately, then reverse the write server-side —
 * either way, finish with a refetch so the cache converges with the server.
 */
export function undoAction<T>(
  queryClient: QueryClient,
  key: QueryKey,
  previous: T | undefined,
  reverse: () => Promise<unknown>,
  onError: () => void,
) {
  if (previous !== undefined) queryClient.setQueryData(key, previous)
  reverse()
    .catch(onError)
    .finally(() => queryClient.invalidateQueries({ queryKey: key }))
}
