import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient, type NodePayload, type NodeUpdatePayload } from './client'
import { queryKeys } from './queryKeys'
import type { NodeResponse, TraverseResponse } from './schemas'

export function useNodesQuery() {
  return useQuery({
    queryKey: queryKeys.nodes,
    queryFn: apiClient.listNodes,
  })
}

export function useNodeQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.node(id),
    queryFn: () => apiClient.getNode(id),
    enabled: Boolean(id),
  })
}

export function useTraverseQuery(id: string, depth: number) {
  return useQuery({
    queryKey: queryKeys.traverse(id, depth),
    queryFn: () => apiClient.traverseFromNode(id, depth),
    enabled: Boolean(id),
  })
}

export function useCreateNodeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: NodePayload) => apiClient.createNode(payload),
    onSuccess: (node) => {
      queryClient.setQueryData(queryKeys.node(node.id), node)
      void queryClient.invalidateQueries({ queryKey: queryKeys.nodes })
    },
  })
}

export function useUpdateNodeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NodeUpdatePayload }) =>
      apiClient.updateNode(id, payload),
    onSuccess: (node) => {
      queryClient.setQueryData(queryKeys.node(node.id), node)
      void queryClient.invalidateQueries({ queryKey: queryKeys.nodes })
      void queryClient.invalidateQueries({ queryKey: queryKeys.traverse(node.id, 2) })
    },
  })
}

export type { NodeResponse, TraverseResponse }
