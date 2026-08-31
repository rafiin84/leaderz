import { useQuery } from '@tanstack/react-query'
import { fetchLeader, fetchTeam, fetchTenants } from '@/lib/api'

export function useTenants() {
  return useQuery({ queryKey: ['tenants'], queryFn: fetchTenants, staleTime: Infinity })
}

export function useLeader(tenantId: string) {
  return useQuery({
    queryKey: ['leader', tenantId],
    queryFn: () => fetchLeader(tenantId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeam(tenantId: string) {
  return useQuery({
    queryKey: ['team', tenantId],
    queryFn: () => fetchTeam(tenantId),
    staleTime: 5 * 60 * 1000,
  })
}
