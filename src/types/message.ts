import type { ID, Timestamps } from './common'

export interface Message {
  id: ID
  /** True when the leader sent it, which decides the bubble side. */
  fromMe: boolean
  body: string
  sentAt: string
  /** Attached image URLs, rendered as a grid under the text. */
  mediaUrls?: string[]
}

export interface Conversation extends Timestamps {
  id: ID
  tenantId: ID
  name: string
  /** Role or organisation, shown under the name in the thread header. */
  subtitle?: string
  avatarUrl?: string
  isVerified?: boolean
  /** Unread count for the leader. */
  unread: number
  messages: Message[]
}
