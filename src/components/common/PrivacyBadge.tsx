import { Lock, UsersThree, Globe, Eye } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { PrivacyLevel } from '@/types/common'
import { PRIVACY_LABELS } from '@/lib/permissions'

const icons = {
  public: Globe,
  team_accessible: UsersThree,
  leader_private: Eye,
  leader_only: Lock,
}

const colors: Record<PrivacyLevel, string> = {
  public: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  team_accessible: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  leader_private: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  leader_only: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800',
}

interface Props {
  level: PrivacyLevel
  compact?: boolean
  className?: string
}

export function PrivacyBadge({ level, compact = false, className }: Props) {
  const Icon = icons[level]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', colors[level], className)}>
      <Icon size={12} weight="bold" />
      {!compact && PRIVACY_LABELS[level]}
    </span>
  )
}
