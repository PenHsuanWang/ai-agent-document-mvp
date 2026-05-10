interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

/** Modal confirmation dialog used before destructive actions (e.g., delete). */
export function ConfirmDialog({ message, onConfirm, onCancel, isLoading }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm action"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <p className="text-sm text-slate-700">{message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
