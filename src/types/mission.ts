import type { ID, Timestamps, MediaItem } from './common'

export interface Mission extends Timestamps {
  id: ID
  tenantId: ID
  title: string
  statement: string
  vision: string
  coverImageUrl?: string
  topics: Topic[]
  initiativeIds: ID[]
  eventIds: ID[]
  impact: MissionImpact
  geographicFocus: string[]
  isActive: boolean
}

export interface MissionImpact {
  peopleReached: number
  districtsActive: number
  activitiesCount: number
  projectsDiscovered: number
  jobsCreated: number
  fundingFacilitated: number
  studentsSupported: number
  organizationsInvolved: number
}

export interface Topic extends Timestamps {
  id: ID
  tenantId: ID
  missionId: ID
  name: string
  description?: string
  color?: string
  postCount: number
  eventCount: number
  followerCount: number
}

export interface Initiative extends Timestamps {
  id: ID
  tenantId: ID
  missionId: ID
  topicIds: ID[]
  title: string
  description: string
  coverImageUrl?: string
  status: 'planning' | 'active' | 'completed' | 'paused'
  geographicScope: GeographicScope
  eventIds: ID[]
  participantCount: number
  districtCount: number
  startDate?: string
  endDate?: string
}

export interface GeographicScope {
  level: 'india' | 'state' | 'district' | 'local'
  stateIds?: ID[]
  districtIds?: ID[]
}

export interface Event extends Timestamps {
  id: ID
  tenantId: ID
  missionId?: ID
  initiativeId?: ID
  topicIds: ID[]
  title: string
  description: string
  coverImageUrl?: string
  organizer: string
  date: string
  endDate?: string
  isOngoing: boolean
  geographicScope: GeographicScope
  stateId?: ID
  stateName?: string
  districtId?: ID
  districtName?: string
  participantCount: number
  localActivities: LocalActivity[]
  status: 'upcoming' | 'active' | 'completed'
  allowFollowerActivities: boolean
  feedIds: ID[]
}

export interface LocalActivity extends Timestamps {
  id: ID
  eventId: ID
  tenantId: ID
  title: string
  description?: string
  location: string
  districtId: ID
  districtName: string
  stateId: ID
  stateName: string
  date?: string
  participantCount: number
  createdByFollower: boolean
  creatorName?: string
  status: 'pending' | 'approved' | 'active' | 'completed'
  mediaUrls: string[]
}

export interface Project extends Timestamps {
  id: ID
  tenantId: ID
  missionId?: ID
  topicIds: ID[]
  eventId?: ID
  title: string
  tagline?: string
  description: string
  problem: string
  solution: string
  heroImageUrl: string
  mediaItems: MediaItem[]
  team: ProjectTeamMember[]
  location: string
  districtId?: ID
  districtName?: string
  stateId?: ID
  stateName?: string
  status: 'active' | 'seeking_support' | 'funded' | 'completed'
  needs: ProjectNeed[]
  credentials: Credential[]
  milestones: Milestone[]
  followerCount: number
  viewCount: number
  tags: string[]
}

export interface ProjectTeamMember {
  id: ID
  name: string
  role: string
  avatarUrl?: string
  bio?: string
  linkedinUrl?: string
}

export interface ProjectNeed {
  type: 'funding' | 'mentorship' | 'jobs' | 'education' | 'partnership' | 'awareness' | 'equipment'
  label: string
  description?: string
  amount?: number
}

export interface Credential {
  id: ID
  type: 'award' | 'patent' | 'certification' | 'publication' | 'media' | 'achievement'
  title: string
  issuer?: string
  date?: string
  description?: string
  url?: string
}

export interface Milestone {
  id: ID
  title: string
  date: string
  description?: string
  achieved: boolean
}

export interface Opportunity extends Timestamps {
  id: ID
  tenantId: ID
  missionId?: ID
  topicIds: ID[]
  type: 'job' | 'internship' | 'education' | 'scholarship' | 'funding' | 'mentorship' | 'partnership' | 'training'
  title: string
  description: string
  organization: string
  organizationLogoUrl?: string
  location?: string
  stateId?: ID
  districtId?: ID
  eligibility?: string
  deadline?: string
  applicationUrl?: string
  amount?: string
  isRemote?: boolean
  tags: string[]
  status: 'open' | 'closed' | 'upcoming'
}
