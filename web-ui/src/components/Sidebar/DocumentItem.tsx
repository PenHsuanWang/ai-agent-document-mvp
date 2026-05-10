import { useCallback, useState } from 'react'
import { useDeleteDocument } from '../../hooks/useDocuments'
import { ConfirmDialog } from '../shared/ConfirmDialog'

interface DocumentItemProps {
  filename: string
}

/**
 * A single row in the sidebar document list.
 * Shows the filename and a delete button (visible on hover).
 * Delete requires a confirmation dialog before calling the API.
 */
export function DocumentItem({ filename }: DocumentItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { mutate: deleteDoc, isPending } = useDeleteDocument()

  const handleDelete = useCallback(() => {
    deleteDoc(filename, { onSettled: () => setConfirmOpen(false) })
  }, [deleteDoc, filename])

  // Derive a friendly display name (strip extension for display label)
  const ext = filename.includes('.') ? filename.split('.').pop() : ''
  const baseName = ext ? filename.slice(0, -(ext.length + 1)) : filename

  return (
    <>
      <div
        className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-slate-300 transition hover:bg-slate-700"
        role="listitem"
      >
        {/* Document icon */}
        <svg
          className="h-4 w-4 shrink-0 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>

        <span className="flex-1 truncate text-xs" title={filename}>
          <span className="font-medium">{baseName}</span>
          {ext && <span className="text-slate-500">.{ext}</span>}
        </span>

        {/* Delete button — always visible on touch, hover-only on mouse */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
          aria-label={`Delete ${filename}`}
          className="shrink-0 rounded p-0.5 text-slate-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          message={`Delete "${filename}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
          isLoading={isPending}
        />
      )}
    </>
  )
}
