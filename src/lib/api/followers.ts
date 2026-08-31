import { delay } from './index'
import { MOCK_FOLLOWERS } from '@/data/mock/followers'
import type { Follower } from '@/types/leader'

export async function fetchFollowers(tenantId: string): Promise<Follower[]> {
  return delay(
    MOCK_FOLLOWERS.filter(f =>
      f.leaderRelationships.some(r => r.tenantId === tenantId && !r.isBlocked)
    )
  )
}

export async function fetchFollower(followerId: string): Promise<Follower | null> {
  return delay(MOCK_FOLLOWERS.find(f => f.id === followerId) ?? null)
}
