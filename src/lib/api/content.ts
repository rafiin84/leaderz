import { delay } from './index'
import { MOCK_POSTS, MOCK_REELS } from '@/data/mock/content'
import type { Post, Reel } from '@/types/content'

export async function fetchPosts(tenantId: string): Promise<Post[]> {
  return delay(MOCK_POSTS[tenantId] ?? [])
}

export async function fetchPost(tenantId: string, postId: string): Promise<Post | null> {
  return delay((MOCK_POSTS[tenantId] ?? []).find(p => p.id === postId) ?? null)
}

export async function fetchReels(tenantId: string): Promise<Reel[]> {
  return delay(MOCK_REELS[tenantId] ?? [])
}

export async function fetchReel(tenantId: string, reelId: string): Promise<Reel | null> {
  return delay((MOCK_REELS[tenantId] ?? []).find(r => r.id === reelId) ?? null)
}
