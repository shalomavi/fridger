import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { AppRoutes } from '@/app/routes'
import './index.css'

// Polling stands in for Realtime: two people in one house cannot tell the
// difference, and it costs no subscription lifecycle code. See the plan, §2.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      staleTime: 2000,
      // Must be >= persistOptions.maxAge below, or react-query garbage
      // collects a query from memory before the persisted copy expires.
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
})

// Offline reads (slice 6, plan §7.3): the last-fetched shopping list,
// pantry, and meal suggestion render immediately from localStorage — on a
// cold start with no network, or between installs — then revalidate once a
// real fetch succeeds. This is a read cache only: writes (add/check off/
// consume) still require a live connection, same as before.
const persister = createAsyncStoragePersister({
  storage: window.localStorage,
  key: 'fridger-query-cache',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000,
        // Bump this if a cached query's shape ever changes incompatibly
        // (e.g. a renamed field) — invalidates every previously-persisted
        // cache on the next load instead of rendering stale-shaped data.
        buster: 'v1',
      }}
    >
      <AppRoutes />
    </PersistQueryClientProvider>
  </StrictMode>,
)
