export type ID = string

export type PrivacyLevel = 'public' | 'team_accessible' | 'leader_private' | 'leader_only'

export type UserRole = 'leader' | 'team_admin' | 'team_relationship_manager' | 'team_content_manager' | 'team_event_manager' | 'team_moderator' | 'follower'

export interface Timestamps {
  createdAt: string
  updatedAt: string
}

export interface Reaction {
  type: 'like' | 'heart' | 'insightful' | 'support'
  count: number
  userReacted: boolean
}

export interface Comment {
  id: ID
  authorId: ID
  authorName: string
  authorAvatar?: string
  text: string
  createdAt: string
  reactions: Reaction[]
}

export interface MediaItem {
  id: ID
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  caption?: string
  width?: number
  height?: number
  duration?: number
}

export interface Notification {
  id: ID
  tenantId: ID
  type: 'follow' | 'comment' | 'reaction' | 'mention' | 'event' | 'mission' | 'birthday' | 'followup' | 'ai_suggestion' | 'project' | 'opportunity'
  title: string
  body: string
  actorId?: ID
  actorName?: string
  actorAvatar?: string
  targetId?: ID
  targetType?: string
  read: boolean
  createdAt: string
}

export interface AISuggestion {
  id: ID
  tenantId: ID
  type: 'relationship' | 'mission' | 'discovery' | 'content' | 'briefing'
  title: string
  body: string
  reason: string
  actionLabel?: string
  targetId?: ID
  targetType?: string
  priority: 'high' | 'medium' | 'low'
  dismissed: boolean
  saved: boolean
  createdAt: string
}

export interface Organization {
  id: ID
  name: string
  type: string
  location?: string
  website?: string
  logoUrl?: string
}

export type SupportedLocale = 'en' | 'ta' | 'hi'
