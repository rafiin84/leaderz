import { useQuery } from '@tanstack/react-query'
import { fetchFollowers, fetchFollower } from '@/lib/api'

export function useFollowers(tenantId: string) {
  return useQuery({ queryKey: ['followers', tenantId], queryFn: () => fetchFollowers(tenantId), staleTime: 2 * 60 * 1000 })
}

export function useFollower(followerId: string) {
  return useQuery({ queryKey: ['follower', followerId], queryFn: () => fetchFollower(followerId), enabled: !!followerId })
}
