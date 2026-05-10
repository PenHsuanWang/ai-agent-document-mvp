import type {
  DeleteDocumentResponse,
  ListDocumentsResponse,
  UploadDocumentResponse,
} from '../types'

const BASE = '/api/v1/documents'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(body.detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function listDocuments(): Promise<ListDocumentsResponse> {
  const res = await fetch(BASE)
  return handleResponse<ListDocumentsResponse>(res)
}

export async function uploadDocument(file: File): Promise<UploadDocumentResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(BASE, { method: 'POST', body: form })
  return handleResponse<UploadDocumentResponse>(res)
}

export async function deleteDocument(filename: string): Promise<DeleteDocumentResponse> {
  const res = await fetch(`${BASE}/${encodeURIComponent(filename)}`, { method: 'DELETE' })
  return handleResponse<DeleteDocumentResponse>(res)
}
