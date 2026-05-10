import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteDocument, listDocuments, uploadDocument } from '../api/documents'

// Documents are server state → TanStack Query (per state_management_flow.md)
export const DOCUMENTS_QUERY_KEY = ['documents'] as const

export function useDocuments() {
  return useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: listDocuments,
    staleTime: 30_000, // treat as fresh for 30 s
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
    },
  })
}
