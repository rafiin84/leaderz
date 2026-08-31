import { useQuery } from '@tanstack/react-query'
import { fetchNotifications, fetchAISuggestions } from '@/lib/api'

export function useNotifications(tenantId: string) {
  return useQuery({ queryKey: ['notifications', tenantId], queryFn: () => fetchNotifications(tenantId), staleTime: 30 * 1000 })
}

export function useAISuggestions(tenantId: string) {
  return useQuery({ queryKey: ['ai-suggestions', tenantId], queryFn: () => fetchAISuggestions(tenantId), staleTime: 60 * 1000 })
}
