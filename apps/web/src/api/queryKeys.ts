export const queryKeys = {
  nodes: ['nodes'] as const,
  node: (id: string) => ['nodes', id] as const,
  traverse: (id: string, depth: number) => ['graph', 'traverse', id, depth] as const,
}
