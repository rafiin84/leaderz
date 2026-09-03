import { delay } from './index'
import { MOCK_CONVERSATIONS } from '@/data/mock/messages'
import type { Conversation } from '@/types/message'

export async function fetchConversations(tenantId: string): Promise<Conversation[]> {
  const list = MOCK_CONVERSATIONS[tenantId] ?? []
  // Most recently active first, which is how a message list reads.
  return delay(
    [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  )
}
