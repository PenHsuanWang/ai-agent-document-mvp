import { useCallback, useRef, useState } from 'react'

interface MessageInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

/**
 * Multi-line textarea fixed at the bottom of the chat area.
 * Sends on Enter (without Shift) or on clicking the Send button.
 */
export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (!value.trim() || isLoading) return
    onSend(value)
    setValue('')
    textareaRef.current?.focus()
  }, [value, isLoading, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3">
      <div className="flex items-end gap-3 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type your question here…"
          disabled={isLoading}
          aria-label="Message input"
          className="max-h-40 flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          style={{ lineHeight: '1.5rem' }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          aria-label="Send message"
          className="shrink-0 rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>
      <p className="mt-1.5 text-xs text-slate-400">
        Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for a new line
      </p>
    </div>
  )
}
