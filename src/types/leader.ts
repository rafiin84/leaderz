import type { ID, PrivacyLevel, Timestamps, UserRole } from './common'

export interface Tenant {
  id: ID
  slug: string
  leaderName: string
  leaderTitle: string
  leaderOrganization: string
  leaderBio: string
  avatarUrl: string
  coverImageUrl?: string
  brandColor: string
  brandColorForeground: string
  followerCount: number
  isVerified: boolean
  createdAt: string
}

export interface Leader extends Timestamps {
  id: ID
  tenantId: ID
  name: string
  title: string
  organization: string
  bio: string
  avatarUrl: string
  coverImageUrl?: string
  location: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
  }
  followerCount: number
  postCount: number
  reelCount: number
  isVerified: boolean
}

export interface TeamMember extends Timestamps {
  id: ID
  tenantId: ID
  name: string
  role: UserRole
  email: string
  phone?: string
  avatarUrl?: string
  title: string
  isActive: boolean
  permissions: TeamPermission[]
}

export interface TeamPermission {
  resource: 'contacts' | 'content' | 'events' | 'followers' | 'analytics' | 'team' | 'mission'
  actions: ('read' | 'create' | 'update' | 'delete')[]
  privacyLevels: PrivacyLevel[]
}

export interface Follower extends Timestamps {
  id: ID
  name: string
  phone?: string
  avatarUrl?: string
  bio?: string
  location?: string
  interests: string[]
  skills?: string[]
  education?: string
  occupation?: string
  // Per-leader relationship data (never cross-tenant)
  leaderRelationships: FollowerLeaderRelationship[]
}

export interface FollowerLeaderRelationship {
  leaderId: ID
  tenantId: ID
  followedAt: string
  isBlocked: boolean
  isMuted: boolean
  eventParticipation: ID[]
  activityCount: number
  lastActiveAt: string
}
