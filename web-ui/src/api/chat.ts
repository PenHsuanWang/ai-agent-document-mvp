import type { ChatApiResponse } from '../types'

export async function sendChatMessage(
  sessionId: string,
  userMessage: string,
): Promise<ChatApiResponse> {
  const res = await fetch('/api/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, user_message: userMessage }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(body.detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<ChatApiResponse>
}
