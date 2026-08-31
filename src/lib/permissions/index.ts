import type { UserRole, PrivacyLevel } from '@/types/common'

const PRIVACY_ACCESS_MAP: Record<UserRole, PrivacyLevel[]> = {
  leader: ['public', 'team_accessible', 'leader_private', 'leader_only'],
  team_admin: ['public', 'team_accessible'],
  team_relationship_manager: ['public', 'team_accessible'],
  team_content_manager: ['public'],
  team_event_manager: ['public'],
  team_moderator: ['public'],
  follower: ['public'],
}

export function canViewPrivacyLevel(role: UserRole, level: PrivacyLevel): boolean {
  return PRIVACY_ACCESS_MAP[role]?.includes(level) ?? false
}

export function canViewContact(role: UserRole, privacyLevel: PrivacyLevel): boolean {
  return canViewPrivacyLevel(role, privacyLevel)
}

export function canCreateContent(role: UserRole): boolean {
  return ['leader', 'team_admin', 'team_content_manager'].includes(role)
}

export function canManageTeam(role: UserRole): boolean {
  return ['leader', 'team_admin'].includes(role)
}

export function canManageMission(role: UserRole): boolean {
  return ['leader', 'team_admin', 'team_event_manager'].includes(role)
}

export function canModerateFollowers(role: UserRole): boolean {
  return ['leader', 'team_admin', 'team_moderator'].includes(role)
}

export function isLeader(role: UserRole): boolean {
  return role === 'leader'
}

export function isTeamMember(role: UserRole): boolean {
  return role.startsWith('team_')
}

export function isFollower(role: UserRole): boolean {
  return role === 'follower'
}

export const PRIVACY_LABELS: Record<PrivacyLevel, string> = {
  public: 'Public',
  team_accessible: 'Team Access',
  leader_private: 'Leader Private',
  leader_only: 'Leader Only',
}

export const PRIVACY_COLORS: Record<PrivacyLevel, string> = {
  public: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  team_accessible: 'text-blue-600 bg-blue-50 border-blue-200',
  leader_private: 'text-amber-600 bg-amber-50 border-amber-200',
  leader_only: 'text-red-600 bg-red-50 border-red-200',
}
