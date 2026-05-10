import { useCallback, useRef } from 'react'
import { useDocuments, useUploadDocument } from '../../hooks/useDocuments'
import { DocumentItem } from './DocumentItem'

interface SidebarProps {
  /** Called when the close/overlay button is tapped on mobile. */
  onClose: () => void
}

/**
 * Left sidebar — displays the document list and upload controls.
 *
 * State classification (per state_management_flow.md):
 *   - Document list → server state → useDocuments() (TanStack Query)
 *   - Upload error  → local UI state (inside useUploadDocument mutation)
 */
export function Sidebar({ onClose }: SidebarProps) {
  const { data, isLoading, isError } = useDocuments()
  const { mutate: upload, isPending: isUploading, error: uploadError } = useUploadDocument()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      upload(file)
      // Reset the input so the same file can be re-selected after deletion.
      e.target.value = ''
    },
    [upload],
  )

  const documents = data?.documents ?? []

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-800">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between px-4 py-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Local Documents
        </span>

        <div className="flex items-center gap-1">
          {/* Add document button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Upload a document"
            title="Upload document (.txt, .md, .csv)"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            {isUploading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </button>

          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white md:hidden"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.csv"
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-700" />

      {/* ── Document list ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Document list">
        {isLoading && (
          <p className="px-2 text-xs text-slate-500">Loading documents…</p>
        )}

        {isError && (
          <p className="px-2 text-xs text-red-400">Failed to load documents.</p>
        )}

        {!isLoading && !isError && documents.length === 0 && (
          <p className="px-2 text-xs text-slate-500">
            No documents yet. Click <strong className="text-slate-400">+</strong> to upload one.
          </p>
        )}

        {documents.length > 0 && (
          <ul role="list" className="space-y-0.5">
            {documents.map((filename) => (
              <li key={filename}>
                <DocumentItem filename={filename} />
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* ── Upload error banner ──────────────────────────────────────────── */}
      {uploadError && (
        <div
          role="alert"
          className="mx-3 mb-3 rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-300"
        >
          {uploadError.message}
        </div>
      )}

      {/* ── Footer hint ─────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-700 px-4 py-3">
        <p className="text-xs text-slate-600">
          Accepts <code className="text-slate-500">.txt .md .csv</code>
        </p>
      </div>
    </aside>
  )
}
