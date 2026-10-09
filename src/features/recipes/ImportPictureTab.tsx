import { SkeletonCard } from '@/shared/ui/SkeletonCard'
import { useRef, useState } from 'react'
import { resizeImage } from './resizeImage'
import { useParseRecipeFromImage } from './useParseRecipe'
import type { ParsedRecipe, RecipeSource } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { Button } from '@/shared/ui/Button'
import { ImageIcon } from '@/shared/ui/FormIcons'
import { cancelButtonClass } from './importButtonClass'

export function ImportPictureTab({
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [resizing, setResizing] = useState(false)
  const parseRecipe = useParseRecipeFromImage(householdId)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setResizing(true)
    try {
      const base64 = await resizeImage(file)
      setImageBase64(base64)
      setPreview(`data:image/jpeg;base64,${base64}`)
    } catch {
      notify(t('actionFailed'), 'error')
    } finally {
      setResizing(false)
    }
  }

  function onSubmit() {
    if (!imageBase64) return
    parseRecipe.mutate(
      { lang, imageBase64 },
      {
        onSuccess: (result) => {
          if (result.isRecipe) {
            onParsed(result, 'image')
          } else {
            notify(t('notARecipeError'), 'error')
          }
        },
        onError: () => notify(t('actionFailed'), 'error'),
      },
    )
  }

  const busy = resizing || parseRecipe.isPending

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      {preview ? (
        <button onClick={() => inputRef.current?.click()} className="block w-full">
          <img src={preview} alt="" className="max-h-48 w-full rounded-md object-contain" />
        </button>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-primary py-6 text-sm text-text-soft"
        >
          <ImageIcon className="text-primary" />
          {t('importRecipePickPhoto')}
        </button>
      )}
      {parseRecipe.isPending && <SkeletonCard />}
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className={cancelButtonClass}>
          {t('cancel')}
        </button>
        <Button onClick={onSubmit} disabled={!imageBase64 || busy} className="px-3 py-1.5 text-sm">
          {busy ? t('thinking') : t('importRecipeParse')}
        </Button>
      </div>
    </div>
  )
}
