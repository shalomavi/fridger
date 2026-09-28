import { useState } from 'react'
import { useParseRecipeFromUrl } from './useParseRecipe'
import type { ParsedRecipe, RecipeSource } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { Button } from '@/shared/ui/Button'
import { fieldClass } from '@/shared/ui/Input'
import { cancelButtonClass } from './importButtonClass'

export function ImportLinkTab({
  householdId,
  onClose,
  onParsed,
}: {
  householdId: string
  onClose: () => void
  onParsed: (recipe: ParsedRecipe & { isRecipe: true }, source: RecipeSource, sourceUrl?: string) => void
}) {
  const { t, lang } = useLanguage()
  const { notify } = useToast()
  const [url, setUrl] = useState('')
  const parseRecipe = useParseRecipeFromUrl(householdId)

  function onSubmit() {
    const trimmed = url.trim()
    if (!trimmed) return
    parseRecipe.mutate(
      { lang, url: trimmed },
      {
        onSuccess: (result) => {
          if (result.isRecipe) {
            onParsed(result, 'url', trimmed)
          } else {
            notify(t('notARecipeError'), 'error')
          }
        },
        onError: (err) => notify(err instanceof Error ? err.message : t('actionFailed'), 'error'),
      },
    )
  }

  return (
    <div className="space-y-3">
      <input
        autoFocus
        type="url"
        inputMode="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={t('importRecipeLinkPlaceholder')}
        className={`w-full px-3 py-2 text-sm ${fieldClass}`}
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className={cancelButtonClass}>
          {t('cancel')}
        </button>
        <Button onClick={onSubmit} disabled={!url.trim() || parseRecipe.isPending} className="px-3 py-1.5 text-sm">
          {parseRecipe.isPending ? t('thinking') : t('importRecipeParse')}
        </Button>
      </div>
    </div>
  )
}
