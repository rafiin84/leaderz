import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { MissionUpdate } from '@/types/mission'

/**
 * Field updates posted from the Mission page.
 *
 * There is no backend, so these live in the React Query cache for the session:
 * staleTime/gcTime are Infinity so the seed query never re-runs and wipes what
 * the user added. Wiring this to a real API means replacing the queryFn and
 * turning addMissionUpdate into a mutation.
 */
export function missionUpdatesKey(tenantId: string) {
  return ['mission-updates', tenantId] as const
}

export function useMissionUpdates(tenantId: string) {
  return useQuery({
    queryKey: missionUpdatesKey(tenantId),
    queryFn: async (): Promise<MissionUpdate[]> => [],
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useAddMissionUpdate(tenantId: string) {
  const queryClient = useQueryClient()
  return (update: MissionUpdate) => {
    queryClient.setQueryData<MissionUpdate[]>(missionUpdatesKey(tenantId), old => [update, ...(old ?? [])])
  }
}

export function useRemoveMissionUpdate(tenantId: string) {
  const queryClient = useQueryClient()
  return (id: string) => {
    queryClient.setQueryData<MissionUpdate[]>(missionUpdatesKey(tenantId), old => (old ?? []).filter(u => u.id !== id))
  }
}
