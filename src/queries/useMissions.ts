import { useQuery } from '@tanstack/react-query'
import { fetchMission, fetchInitiatives, fetchInitiative, fetchEvents, fetchEvent, fetchProjects, fetchProject, fetchOpportunities } from '@/lib/api'

export function useMission(tenantId: string) {
  return useQuery({ queryKey: ['mission', tenantId], queryFn: () => fetchMission(tenantId), staleTime: 5 * 60 * 1000 })
}

export function useInitiatives(tenantId: string) {
  return useQuery({ queryKey: ['initiatives', tenantId], queryFn: () => fetchInitiatives(tenantId), staleTime: 5 * 60 * 1000 })
}

export function useInitiative(tenantId: string, id: string) {
  return useQuery({ queryKey: ['initiative', tenantId, id], queryFn: () => fetchInitiative(tenantId, id), enabled: !!id })
}

export function useEvents(tenantId: string) {
  return useQuery({ queryKey: ['events', tenantId], queryFn: () => fetchEvents(tenantId), staleTime: 5 * 60 * 1000 })
}

export function useEvent(tenantId: string, id: string) {
  return useQuery({ queryKey: ['event', tenantId, id], queryFn: () => fetchEvent(tenantId, id), enabled: !!id })
}

export function useProjects(tenantId: string) {
  return useQuery({ queryKey: ['projects', tenantId], queryFn: () => fetchProjects(tenantId), staleTime: 5 * 60 * 1000 })
}

export function useProject(tenantId: string, id: string) {
  return useQuery({ queryKey: ['project', tenantId, id], queryFn: () => fetchProject(tenantId, id), enabled: !!id })
}

export function useOpportunities(tenantId: string) {
  return useQuery({ queryKey: ['opportunities', tenantId], queryFn: () => fetchOpportunities(tenantId), staleTime: 5 * 60 * 1000 })
}
