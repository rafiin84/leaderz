import { delay } from './index'
import { MOCK_TENANTS, MOCK_LEADERS, MOCK_TEAM } from '@/data/mock/leaders'
import type { Tenant, Leader, TeamMember } from '@/types/leader'

export async function fetchTenants(): Promise<Tenant[]> {
  return delay(MOCK_TENANTS)
}

export async function fetchLeader(tenantId: string): Promise<Leader | null> {
  return delay(MOCK_LEADERS[tenantId] ?? null)
}

export async function fetchTeam(tenantId: string): Promise<TeamMember[]> {
  return delay(MOCK_TEAM[tenantId] ?? [])
}
