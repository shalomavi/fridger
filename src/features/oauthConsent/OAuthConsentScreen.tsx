import { useSearchParams, useNavigate } from 'react-router-dom'
import type { Household } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { Surface } from '@/shared/ui/Surface'
import { useOAuthConsent } from './useOAuthConsent'

/** Landing screen for an OAuth connector's /authorize hand-off (Gemini,
 * and later ChatGPT — see mcp-connector-plan.md §7b/§7c). The Edge
 * Function's GET /authorize validates client_id/redirect_uri before
 * redirecting here; this screen re-sends everything to POST
 * /authorize/approve on Allow, which re-validates server-side too. */
export function OAuthConsentScreen({ household }: { household: Household }) {
  const { t } = useLanguage()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const clientId = params.get('client_id')
  const redirectUri = params.get('redirect_uri')
  const codeChallenge = params.get('code_challenge')
  const codeChallengeMethod = params.get('code_challenge_method')
  const state = params.get('state') ?? ''

  const { clientName, approve } = useOAuthConsent(clientId)

  if (!clientId || !redirectUri || !codeChallenge || codeChallengeMethod !== 'S256' || clientName.isError) {
    return (
      <Surface className="mx-auto mt-12 max-w-sm space-y-2 p-6 text-center">
        <p className="text-sm text-text-muted">{t('oauthConsentInvalid')}</p>
      </Surface>
    )
  }

  function handleApprove() {
    approve.mutate(
      { householdId: household.id, clientId: clientId!, redirectUri: redirectUri!, codeChallenge: codeChallenge!, codeChallengeMethod: codeChallengeMethod!, state },
      {
        onSuccess: (redirectUrl) => {
          window.location.href = redirectUrl
        },
        onError: () => notify(t('actionFailed'), 'error'),
      },
    )
  }

  return (
    <Surface className="mx-auto mt-12 max-w-sm space-y-4 p-6 text-center">
      <h1 className="text-lg font-semibold">{t('oauthConsentHeading')}</h1>
      <p className="text-sm">
        <span className="font-medium">{clientName.isLoading ? t('loading') : clientName.data}</span>{' '}
        {t('oauthConsentWantsAccess')} <span className="font-medium">{household.name}</span>
      </p>
      <p className="text-xs text-text-muted">{t('oauthConsentWarning')}</p>
      <div className="flex gap-2">
        <button
          onClick={() => navigate('/')}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted"
        >
          {t('oauthConsentDeny')}
        </button>
        <button
          onClick={handleApprove}
          disabled={approve.isPending || clientName.isLoading}
          className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {t('oauthConsentApprove')}
        </button>
      </div>
    </Surface>
  )
}
