import { useState } from 'react'
import { useParseRecipeFromText } from './useParseRecipe'
import type { ParsedRecipe } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { Button } from '@/shared/ui/Button'
import { fieldClass } from '@/shared/ui/Input'

/**
 * Paste-text recipe import — a centered overlay, same shell as
 * ConfirmDialog. Picture and link import (later slices) will likely become
 * tabs on this same sheet rather than separate components, but text-only
 * is the whole import surface for now.
 */
export function ImportTextSheet({
  householdId,
  onClose,
  onParsed,
}: {
  householdId: string
  onClose: () => void
  onParsed: (recipe: ParsedRecipe & { isRecipe: true }) => void
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
            onParsed(result)
          } else {
            notify(t('notARecipeError'), 'error')
          }
        },
        onError: () => notify(t('actionFailed'), 'error'),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/5 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        dir={lang === 'he' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
        className={`animate-toast-in w-full max-w-sm space-y-3 rounded-lg bg-surface/70 p-4 shadow-lg ring-1 ring-inset ring-surface-muted/60 backdrop-blur-lg ${
          lang === 'he' ? 'font-ui-he' : 'font-ui-en'
        }`}
      >
        <p className="text-base font-medium text-text">{t('importRecipeFromText')}</p>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('importRecipeTextPlaceholder')}
          rows={8}
          className={`w-full resize-none px-3 py-2 text-sm ${fieldClass}`}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md bg-surface-muted px-3 py-1.5 text-sm text-text-soft transition-transform duration-300 active:scale-95"
          >
            {t('cancel')}
          </button>
          <Button
            onClick={onSubmit}
            disabled={!text.trim() || parseRecipe.isPending}
            className="px-3 py-1.5 text-sm"
          >
            {parseRecipe.isPending ? t('thinking') : t('importRecipeParse')}
          </Button>
        </div>
      </div>
    </div>
  )
}
