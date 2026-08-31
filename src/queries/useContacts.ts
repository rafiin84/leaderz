import { useQuery } from '@tanstack/react-query'
import { fetchContacts, fetchContact, fetchFollowUps, fetchUpcomingBirthdays } from '@/lib/api'
import type { UserRole } from '@/types/common'

export function useContacts(tenantId: string, role: UserRole) {
  return useQuery({
    queryKey: ['contacts', tenantId, role],
    queryFn: () => fetchContacts(tenantId, role),
    staleTime: 2 * 60 * 1000,
  })
}

export function useContact(tenantId: string, contactId: string, role: UserRole) {
  return useQuery({
    queryKey: ['contact', tenantId, contactId, role],
    queryFn: () => fetchContact(tenantId, contactId, role),
    staleTime: 2 * 60 * 1000,
    enabled: !!contactId,
  })
}

export function useFollowUps(tenantId: string, role: UserRole) {
  return useQuery({
    queryKey: ['followups', tenantId, role],
    queryFn: () => fetchFollowUps(tenantId, role),
    staleTime: 60 * 1000,
  })
}

export function useUpcomingBirthdays(tenantId: string, role: UserRole) {
  return useQuery({
    queryKey: ['birthdays', tenantId, role],
    queryFn: () => fetchUpcomingBirthdays(tenantId, role),
    staleTime: 60 * 1000,
  })
}
