import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listConnectedApps, revokeConnectedApp } from './connectedApps'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'

const QUERY_KEY = ['connected-apps'] as const

/** Query + revoke mutation for ConnectedAppsSettings.tsx, split out to keep
 * that file's render under the size limit — same pattern as useMcpTokens.ts. */
export function useConnectedApps(householdId: string | undefined) {
  const { t } = useLanguage()
  const { notify } = useToast()
  const queryClient = useQueryClient()

  const apps = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => listConnectedApps(householdId!),
    enabled: !!householdId,
    refetchInterval: false,
  })

  const revoke = useMutation({
    mutationFn: (connectionId: string) => revokeConnectedApp(householdId!, connectionId),
    onSuccess: async () => {
      notify(t('connectedAppsDisconnected'), 'success')
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
    onError: () => notify(t('actionFailed'), 'error'),
  })

  return { apps, revoke }
}
