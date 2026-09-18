import { useConfirm } from '@/shared/alerts/ConfirmContext'
import { useLanguage } from '@/features/household/useLanguage'
import { TrashIcon } from '@/shared/ui/FormIcons'

/** Trash icon button, gated behind a confirm — the confirm dialog is still
 * worth it even with the toast's Undo (useShoppingList.ts) since the row is
 * gone the instant you tap and Undo only lasts as long as the toast. */
export function DeleteButton({
  onDelete,
  label,
  confirmMessage,
}: {
  onDelete: () => void
  label: string
  confirmMessage: string
}) {
  const confirm = useConfirm()
  const { t } = useLanguage()

  return (
    <button
      onClick={async (e) => {
        e.stopPropagation()
        const confirmed = await confirm({
          message: confirmMessage,
          confirmLabel: label,
          cancelLabel: t('cancel'),
          destructive: true,
        })
        if (confirmed) onDelete()
      }}
      aria-label={label}
      className="flex-none p-1 text-danger transition-transform duration-300 active:scale-95"
    >
      <TrashIcon />
    </button>
  )
}
