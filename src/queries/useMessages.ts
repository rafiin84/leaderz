import { useQuery } from '@tanstack/react-query'
import { fetchConversations } from '@/lib/api'

export function useConversations(tenantId: string) {
  return useQuery({
    queryKey: ['conversations', tenantId],
    queryFn: () => fetchConversations(tenantId),
    staleTime: 60 * 1000,
  })
}
