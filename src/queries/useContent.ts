import { useQuery } from '@tanstack/react-query'
import { fetchPosts, fetchReels } from '@/lib/api'

export function usePosts(tenantId: string) {
  return useQuery({
    queryKey: ['posts', tenantId],
    queryFn: () => fetchPosts(tenantId),
    staleTime: 60 * 1000,
  })
}

export function useReels(tenantId: string) {
  return useQuery({
    queryKey: ['reels', tenantId],
    queryFn: () => fetchReels(tenantId),
    staleTime: 60 * 1000,
  })
}
