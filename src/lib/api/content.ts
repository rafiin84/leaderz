import { delay } from './index'
import { MOCK_POSTS, MOCK_REELS } from '@/data/mock/content'
import { SVEMBU_POSTS } from '@/data/mock/svembu'
import type { Post, Reel } from '@/types/content'

/**
 * Sridhar's feed leads with his real X posts (newest first), followed by the
 * synthetic in-app posts. Other tenants are unaffected.
 */
function postsFor(tenantId: string): Post[] {
  const own = MOCK_POSTS[tenantId] ?? []
  if (tenantId !== 'tenant-sridhar') return own
  const external = [...SVEMBU_POSTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return [...external, ...own]
}

export async function fetchPosts(tenantId: string): Promise<Post[]> {
  return delay(postsFor(tenantId))
}

export async function fetchPost(tenantId: string, postId: string): Promise<Post | null> {
  return delay(postsFor(tenantId).find(p => p.id === postId) ?? null)
}

export async function fetchReels(tenantId: string): Promise<Reel[]> {
  return delay(MOCK_REELS[tenantId] ?? [])
}

export async function fetchReel(tenantId: string, reelId: string): Promise<Reel | null> {
  return delay((MOCK_REELS[tenantId] ?? []).find(r => r.id === reelId) ?? null)
}
