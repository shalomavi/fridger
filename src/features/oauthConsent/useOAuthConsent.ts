import { useMutation, useQuery } from '@tanstack/react-query'
import { approveOAuthConsent, getOAuthClientName, type ConsentRequest } from './oauthConsent'

/** Query + approve mutation for OAuthConsentScreen.tsx, split out to keep
 * that file's render under the size limit — same pattern as useMcpTokens.ts. */
export function useOAuthConsent(clientId: string | null) {
  const clientName = useQuery({
    queryKey: ['oauth-client', clientId],
    queryFn: () => getOAuthClientName(clientId!),
    enabled: !!clientId,
    retry: false,
  })

  const approve = useMutation({
    mutationFn: (request: ConsentRequest) => approveOAuthConsent(request),
  })

  return { clientName, approve }
}
