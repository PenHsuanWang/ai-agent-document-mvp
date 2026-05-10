import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage } from '../../types'

// ---------------------------------------------------------------------------
// Markdown component overrides — styled tables, code blocks, lists
// ---------------------------------------------------------------------------

const markdownComponents: Components = {
  // Tables: styled with borders, padded cells, alternating row colours
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="even:bg-slate-50">{children}</tr>,
  th: ({ children }) => (
    <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">{children}</td>
  ),
  // Code blocks
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-')
    return isBlock ? (
      <pre className="my-3 overflow-x-auto rounded-lg bg-slate-800 p-4">
        <code className="text-xs text-slate-100 font-mono">{children}</code>
      </pre>
    ) : (
      <code className="rounded bg-slate-200 px-1 py-0.5 text-xs font-mono text-slate-800">
        {children}
      </code>
    )
  },
  // Lists
  ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1 text-slate-700">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1 text-slate-700">{children}</ol>,
  li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
  // Paragraphs & headings
  p: ({ children }) => <p className="mb-2 text-sm leading-relaxed text-slate-800">{children}</p>,
  h1: ({ children }) => <h1 className="mb-2 text-base font-bold text-slate-900">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 text-sm font-bold text-slate-900">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold text-slate-900">{children}</h3>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-sky-400 pl-3 text-sm italic text-slate-600">
      {children}
    </blockquote>
  ),
}

// ---------------------------------------------------------------------------
// ChatMessage component
// ---------------------------------------------------------------------------

interface ChatMessageProps {
  message: ChatMessage
}

/**
 * Renders a single chat turn.
 * - User messages: right-aligned, sky-blue bubble.
 * - Agent messages: left-aligned, slate bubble with full markdown rendering.
 */
export function ChatMessageBubble({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
      role="article"
      aria-label={`${isUser ? 'User' : 'Agent'} message`}
    >
      {/* Avatar / label */}
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
          AI
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-br-sm bg-sky-100 text-slate-800'
            : 'rounded-bl-sm bg-slate-100'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {isUser && (
        <div className="ml-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-600">
          U
        </div>
      )}
    </div>
  )
}
