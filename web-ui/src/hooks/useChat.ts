import { useCallback, useRef, useState } from 'react'
import { sendChatMessage } from '../api/chat'
import type { ChatMessage } from '../types'

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'agent',
  content:
    "Hello! I can read the documents in the sidebar. What would you like to know?",
}

// Chat messages are local UI state (not persisted to a server cache).
// Only the API call itself is server interaction — handled via useState + async.
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate one session ID per browser session (not per component mount).
  const sessionId = useRef<string>(crypto.randomUUID())

  const send = useCallback(
    async (userMessage: string) => {
      const trimmed = userMessage.trim()
      if (!trimmed || isLoading) return

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      setError(null)

      try {
        const apiResponse = await sendChatMessage(sessionId.current, trimmed)
        const agentMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'agent',
          content:
            apiResponse.status === 'error'
              ? 'Sorry, I encountered an error. Please try again.'
              : apiResponse.response,
        }
        setMessages((prev) => [...prev, agentMsg])
      } catch {
        setError('Could not reach the agent — is the server running?')
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading],
  )

  return { messages, isLoading, error, send }
}
