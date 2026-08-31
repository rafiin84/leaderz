import type { ID, PrivacyLevel, Timestamps } from './common'

export type ContactCategory =
  | 'government'
  | 'political'
  | 'industrialists_business'
  | 'entrepreneurs_founders'
  | 'investors_finance'
  | 'professional_network'
  | 'academia_education'
  | 'media_communication'
  | 'social_public'
  | 'followers'
  | 'personal'
  | 'organizations_institutions'
  | 'other'

export const CONTACT_CATEGORY_LABELS: Record<ContactCategory, string> = {
  government: 'Government',
  political: 'Political',
  industrialists_business: 'Industrialists & Business Leaders',
  entrepreneurs_founders: 'Entrepreneurs & Founders',
  investors_finance: 'Investors & Finance',
  professional_network: 'Professional Network',
  academia_education: 'Academia & Education',
  media_communication: 'Media & Communication',
  social_public: 'Social / Public Figures',
  followers: 'Followers',
  personal: 'Personal',
  organizations_institutions: 'Organizations & Institutions',
  other: 'Other',
}

export interface Contact extends Timestamps {
  id: ID
  tenantId: ID
  name: string
  title?: string
  organization?: string
  phone?: string
  email?: string
  avatarUrl?: string
  location?: string
  categories: ContactCategory[]
  privacyLevel: PrivacyLevel
  isPersonallyVerified: boolean
  relationshipSummary?: string
  howWeKnow?: string
  lastInteractionDate?: string
  lastInteractionType?: string
  nextFollowUpDate?: string
  nextFollowUpNote?: string
  importantDates: ImportantDate[]
  notes: ContactNote[]
  interactions: ContactInteraction[]
  missionInvolvement?: string[]
  eventParticipation?: ID[]
  tags: string[]
  isFavorite: boolean
}

export interface ImportantDate {
  id: ID
  type: 'birthday' | 'anniversary' | 'meeting' | 'custom'
  label: string
  date: string
  recurring: boolean
}

export interface ContactNote {
  id: ID
  content: string
  privacyLevel: PrivacyLevel
  createdAt: string
  updatedAt: string
}

export interface ContactInteraction {
  id: ID
  type: 'call' | 'message' | 'meeting' | 'email' | 'event' | 'note' | 'wish'
  summary: string
  date: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  followUpRequired?: boolean
  followUpNote?: string
}
