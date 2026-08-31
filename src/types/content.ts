import type { ID, Timestamps, MediaItem, Reaction, Comment } from './common'

export type ContentType = 'text' | 'image' | 'video' | 'article' | 'reel' | 'event_update' | 'initiative_update' | 'project_update' | 'opportunity'

export interface Post extends Timestamps {
  id: ID
  tenantId: ID
  authorId: ID
  authorName: string
  authorTitle?: string
  authorAvatar?: string
  type: ContentType
  text?: string
  media: MediaItem[]
  article?: ArticleContent
  missionId?: ID
  missionTitle?: string
  topicId?: ID
  topicName?: string
  initiativeId?: ID
  initiativeTitle?: string
  eventId?: ID
  eventTitle?: string
  projectId?: ID
  location?: string
  stateId?: ID
  stateName?: string
  districtId?: ID
  districtName?: string
  reactions: Reaction[]
  commentCount: number
  comments: Comment[]
  shareCount: number
  viewCount: number
  isPinned: boolean
  isFollowerPost: boolean
}

export interface ArticleContent {
  title: string
  summary: string
  body: string
  readTimeMinutes: number
  coverImageUrl?: string
}

export interface Reel extends Timestamps {
  id: ID
  tenantId: ID
  authorId: ID
  authorName: string
  authorTitle?: string
  authorAvatar?: string
  videoUrl: string
  posterUrl: string
  caption?: string
  duration: number
  missionId?: ID
  missionTitle?: string
  topicId?: ID
  topicName?: string
  initiativeId?: ID
  eventId?: ID
  location?: string
  stateName?: string
  districtName?: string
  reactions: Reaction[]
  commentCount: number
  comments: Comment[]
  shareCount: number
  viewCount: number
  isFollowerContent: boolean
}
