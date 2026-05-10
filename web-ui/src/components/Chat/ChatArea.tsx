import { useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import { ChatMessageBubble } from './ChatMessage'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'

interface ChatAreaProps {
  /** Called when the hamburger menu icon is clicked on mobile. */
  onMenuClick: () => void
}

/**
 * ChatArea — main content panel containing the header, scrollable message
 * history, a typing indicator, and the fixed message input at the bottom.
 */
export function ChatArea({ onMenuClick }: ChatAreaProps) {
  const { messages, isLoading, error, send } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the latest message whenever messages or loading state changes.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex h-full flex-col bg-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        {/* Hamburger — visible on mobile only */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open document sidebar"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Bot icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.607L5 14.5m14.8.5l1.196 4.784A2.25 2.25 0 0118.8 21.75H5.2a2.25 2.25 0 01-1.996-1.466L4.2 15.5" />
          </svg>
        </div>

        <div>
          <h1 className="text-sm font-semibold text-slate-900">AI Agent</h1>
          <p className="text-xs text-slate-500">Local File Reader &amp; Summarizer</p>
        </div>
      </header>

      {/* ── Message history (scrollable) ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator while waiting for the agent */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="ml-9 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3">
                <TypingIndicator />
              </div>
            </div>
          )}

          {/* Network / server error banner */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Message input (fixed at bottom) ─────────────────────────────── */}
      <div className="shrink-0">
        <MessageInput onSend={send} isLoading={isLoading} />
      </div>
    </div>
  )
}
