import type { ID } from './common'

export interface IndiaState {
  id: ID
  name: string
  code: string
  type: 'state' | 'union_territory'
  capital: string
  region: string
  districts: District[]
}

export interface District {
  id: ID
  stateId: ID
  stateName: string
  name: string
  population?: number
  area?: number
}

export interface GeographyActivityStats {
  stateId: ID
  stateName: string
  districtId?: ID
  districtName?: string
  eventCount: number
  projectCount: number
  participantCount: number
  opportunityCount: number
  postCount: number
  lastActivityDate?: string
}
