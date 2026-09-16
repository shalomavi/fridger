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
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (window.confirm(confirmMessage)) onDelete()
      }}
      aria-label={label}
      className="flex-none p-1 text-danger transition-transform active:scale-95"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M4 7h16" />
        <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
        <path d="M19 7l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" />
      </svg>
    </button>
  )
}
