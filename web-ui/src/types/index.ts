// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type MessageRole = 'user' | 'agent'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
}

// ---------------------------------------------------------------------------
// API response shapes (mirror the FastAPI Pydantic schemas)
// ---------------------------------------------------------------------------

export interface ListDocumentsResponse {
  documents: string[]
  total: number
}

export interface UploadDocumentResponse {
  filename: string
  size_bytes: number
  status: string
}

export interface DeleteDocumentResponse {
  filename: string
  status: string
}

export interface ChatApiResponse {
  response: string
  status: 'success' | 'error'
}
