import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateMcpToken, listMcpTokens, revokeMcpToken } from './mcpTokens'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'

const QUERY_KEY = ['mcp-tokens'] as const

/** Query + generate/revoke mutations for the MCP token settings section,
 * split out of McpTokenSettings.tsx to keep that file's render function
 * under the size limit — same reasoning as useAddShoppingItem.ts. */
export function useMcpTokens(householdId: string | undefined) {
  const { t } = useLanguage()
  const { notify } = useToast()
  const queryClient = useQueryClient()

  const tokens = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => listMcpTokens(householdId!),
    enabled: !!householdId,
    refetchInterval: false,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const generate = useMutation({
    mutationFn: (label: string) => generateMcpToken(householdId!, label.trim() || 'Untitled'),
    onSuccess: async () => {
      notify(t('mcpTokenCreated'), 'success')
      await invalidate()
    },
    onError: () => notify(t('actionFailed'), 'error'),
  })

  const revoke = useMutation({
    mutationFn: revokeMcpToken,
    onSuccess: async () => {
      notify(t('mcpTokenRevoked'), 'success')
      await invalidate()
    },
    onError: () => notify(t('actionFailed'), 'error'),
  })

  return { tokens, generate, revoke }
}
