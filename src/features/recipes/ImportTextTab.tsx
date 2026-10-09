import { SkeletonCard } from '@/shared/ui/SkeletonCard'
import { useState } from 'react'
import { useParseRecipeFromText } from './useParseRecipe'
import type { ParsedRecipe, RecipeSource } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { Button } from '@/shared/ui/Button'
import { fieldClass } from '@/shared/ui/Input'
import { cancelButtonClass } from './importButtonClass'

export function ImportTextTab({
  householdId,
  onClose,
  onParsed,
}: {
  householdId: string
  onClose: () => void
  onParsed: (recipe: ParsedRecipe & { isRecipe: true }, source: RecipeSource) => void
}) {
  const { t, lang } = useLanguage()
  const { notify } = useToast()
  const [text, setText] = useState('')
  const parseRecipe = useParseRecipeFromText(householdId)

  function onSubmit() {
    const trimmed = text.trim()
    if (!trimmed) return
    parseRecipe.mutate(
      { lang, text: trimmed },
      {
        onSuccess: (result) => {
          if (result.isRecipe) {
            onParsed(result, 'text')
          } else {
            notify(t('notARecipeError'), 'error')
          }
        },
        onError: () => notify(t('actionFailed'), 'error'),
      },
    )
  }

  return (
    <div className="space-y-3">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('importRecipeTextPlaceholder')}
        rows={8}
        className={`w-full resize-none px-3 py-2 text-sm ${fieldClass}`}
      />
      {parseRecipe.isPending && <SkeletonCard />}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className={cancelButtonClass}>
          {t('cancel')}
        </button>
        <Button onClick={onSubmit} disabled={!text.trim() || parseRecipe.isPending} className="px-3 py-1.5 text-sm">
          {parseRecipe.isPending ? t('thinking') : t('importRecipeParse')}
        </Button>
      </div>
    </div>
  )
}
