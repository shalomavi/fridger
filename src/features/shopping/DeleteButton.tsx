import { useConfirm } from '@/shared/alerts/ConfirmContext'
import { useLanguage } from '@/features/household/useLanguage'
import { TrashIcon } from '@/shared/ui/FormIcons'

/** Trash icon button, gated behind a confirm — deleting an item has no
 * undo (unlike checking one off, which you can un-tap). */
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
