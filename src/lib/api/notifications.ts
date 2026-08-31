import { delay } from './index'
import { MOCK_NOTIFICATIONS, MOCK_AI_SUGGESTIONS } from '@/data/mock/notifications'
import type { Notification, AISuggestion } from '@/types/common'

export async function fetchNotifications(tenantId: string): Promise<Notification[]> {
  return delay(MOCK_NOTIFICATIONS[tenantId] ?? [])
}

export async function fetchAISuggestions(tenantId: string): Promise<AISuggestion[]> {
  return delay(MOCK_AI_SUGGESTIONS[tenantId] ?? [])
}
