import { delay } from './index'
import { MOCK_MISSIONS, MOCK_INITIATIVES, MOCK_EVENTS, MOCK_PROJECTS, MOCK_OPPORTUNITIES } from '@/data/mock/missions'
import type { Mission, Initiative, Event, Project, Opportunity } from '@/types/mission'

export async function fetchMission(tenantId: string): Promise<Mission | null> {
  return delay(MOCK_MISSIONS[tenantId] ?? null)
}

export async function fetchInitiatives(tenantId: string): Promise<Initiative[]> {
  return delay(MOCK_INITIATIVES[tenantId] ?? [])
}

export async function fetchInitiative(tenantId: string, id: string): Promise<Initiative | null> {
  return delay((MOCK_INITIATIVES[tenantId] ?? []).find(i => i.id === id) ?? null)
}

export async function fetchEvents(tenantId: string): Promise<Event[]> {
  return delay(MOCK_EVENTS[tenantId] ?? [])
}

export async function fetchEvent(tenantId: string, id: string): Promise<Event | null> {
  return delay((MOCK_EVENTS[tenantId] ?? []).find(e => e.id === id) ?? null)
}

export async function fetchProjects(tenantId: string): Promise<Project[]> {
  return delay(MOCK_PROJECTS[tenantId] ?? [])
}

export async function fetchProject(tenantId: string, id: string): Promise<Project | null> {
  return delay((MOCK_PROJECTS[tenantId] ?? []).find(p => p.id === id) ?? null)
}

export async function fetchOpportunities(tenantId: string): Promise<Opportunity[]> {
  return delay(MOCK_OPPORTUNITIES[tenantId] ?? [])
}
