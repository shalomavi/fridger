import { useState } from 'react'
import { ImportTextTab } from './ImportTextTab'
import { ImportPictureTab } from './ImportPictureTab'
import type { ParsedRecipe, RecipeSource } from './api'
import { useLanguage } from '@/features/household/useLanguage'

type Tab = 'text' | 'picture'

/**
 * Recipe import — a centered overlay, same shell as ConfirmDialog, with
 * tabs for each import source. Link import (a later slice) adds a third
 * tab here without touching Text or Picture.
 */
export function ImportRecipeSheet({
  householdId,
  onClose,
  onParsed,
}: {
  householdId: string
  onClose: () => void
  onParsed: (recipe: ParsedRecipe & { isRecipe: true }, source: RecipeSource) => void
}) {
  const { t, lang } = useLanguage()
  const [tab, setTab] = useState<Tab>('text')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/5 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        dir={lang === 'he' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
        className={`animate-toast-in w-full max-w-sm space-y-3 rounded-lg bg-surface/70 p-4 shadow-lg ring-1 ring-inset ring-surface-muted/60 backdrop-blur-lg ${
          lang === 'he' ? 'font-ui-he' : 'font-ui-en'
        }`}
      >
        <p className="text-base font-medium text-text">{t('importRecipe')}</p>
        <div className="flex gap-1 rounded-md bg-surface-muted/50 p-1">
          {(['text', 'picture'] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`flex-1 rounded px-2 py-1.5 text-sm transition-colors ${
                tab === tabId ? 'bg-surface text-text shadow-sm' : 'text-text-soft'
              }`}
            >
              {t(tabId === 'text' ? 'importRecipeTabText' : 'importRecipeTabPicture')}
            </button>
          ))}
        </div>

        {tab === 'text' && <ImportTextTab householdId={householdId} onClose={onClose} onParsed={onParsed} />}
        {tab === 'picture' && <ImportPictureTab householdId={householdId} onClose={onClose} onParsed={onParsed} />}
      </div>
    </div>
  )
}
