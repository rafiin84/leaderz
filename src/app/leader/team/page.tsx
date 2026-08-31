'use client'
import { motion } from 'framer-motion'
import { UsersThree, Plus, Shield, Lock } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useTeam } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { Skeleton } from '@/components/common/Skeleton'
import { cn } from '@/lib/utils'

const roleLabels: Record<string, string> = {
  team_admin: 'Administrator',
  team_relationship_manager: 'Relationship Manager',
  team_content_manager: 'Content Manager',
  team_event_manager: 'Event & Mission Manager',
  team_moderator: 'Community Moderator',
}

const roleColors: Record<string, string> = {
  team_admin: 'bg-primary/10 text-primary',
  team_relationship_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  team_content_manager: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  team_event_manager: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  team_moderator: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

export default function TeamPage() {
  const { activeTenantId, userRole } = useAppStore()
  const { data: team, isLoading } = useTeam(activeTenantId)

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <UsersThree size={20} className="text-primary" weight="fill" />
          <h1 className="text-xl font-bold flex-1">Team</h1>
          {userRole === 'leader' && (
            <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus size={16} weight="bold" />
              Add
            </button>
          )}
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Privacy notice */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Lock size={14} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-400">Team members can only access contacts and data up to their permitted privacy level. Leader Only contacts are never visible to team.</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" /></div>
            </div>
          ))}</div>
        ) : (
          <div className="space-y-3">
            {team?.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-4 rounded-2xl border bg-card hover:shadow-md transition-all card-hover"
              >
                <Avatar src={member.avatarUrl} name={member.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.title}</p>
                  <span className={cn('mt-1.5 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full', roleColors[member.role])}>
                    {roleLabels[member.role] ?? member.role}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield size={14} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{member.permissions.length} perms</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
