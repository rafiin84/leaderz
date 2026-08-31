'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap, CalendarBlank,
  UserPlus, ChatCircle, Star
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useFollower } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { Skeleton } from '@/components/common/Skeleton'
import { CommunicationComposer } from '@/components/contacts/CommunicationComposer'
import { formatRelativeTime, formatDate } from '@/lib/formatting'

export default function FollowerDetailClient() {
  const params = useParams()
  const router = useRouter()
  const { activeTenantId } = useAppStore()
  const followerId = params.id as string
  const { data: follower, isLoading } = useFollower(followerId)
  const [composerOpen, setComposerOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    )
  }

  if (!follower) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Follower not found.</p>
        <button onClick={() => router.back()} className="text-primary text-sm font-medium mt-4">Go back</button>
      </div>
    )
  }

  const rel = follower.leaderRelationships.find(r => r.tenantId === activeTenantId)

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold flex-1 truncate">{follower.name}</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
          <Avatar src={follower.avatarUrl} name={follower.name} size="xl" />
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-xl font-bold text-foreground">{follower.name}</h2>
            {follower.occupation && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Briefcase size={13} />
                {follower.occupation}
              </p>
            )}
            {follower.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin size={12} />
                {follower.location}
              </p>
            )}
            {follower.education && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <GraduationCap size={12} />
                {follower.education}
              </p>
            )}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <UserPlus size={16} weight="bold" />
            Add as Contact
          </button>
          <button
            onClick={() => setComposerOpen(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            <ChatCircle size={16} />
            Message
          </button>
        </motion.div>

        {/* Relationship stats */}
        {rel && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-2xl border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Relationship</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{rel.activityCount}</p>
                <p className="text-[10px] text-muted-foreground">Interactions</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{rel.eventParticipation.length}</p>
                <p className="text-[10px] text-muted-foreground">Events</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{formatRelativeTime(rel.lastActiveAt)}</p>
                <p className="text-[10px] text-muted-foreground">Last active</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarBlank size={12} />
              Following since {formatDate(rel.followedAt)}
            </div>
          </motion.div>
        )}

        {/* Bio */}
        {follower.bio && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border bg-card p-4">
            <p className="text-sm text-foreground leading-relaxed">{follower.bio}</p>
          </motion.div>
        )}

        {/* Interests */}
        {follower.interests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="rounded-2xl border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {follower.interests.map(interest => (
                <span key={interest} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skills */}
        {follower.skills && follower.skills.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <div className="rounded-2xl border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {follower.skills.map(skill => (
                  <span key={skill} className="text-xs px-3 py-1.5 rounded-full bg-muted text-foreground font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI insight */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-indigo-600" weight="fill" />
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">AI Insight</p>
            </div>
            <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
              {follower.name.split(' ')[0]} is a {rel && rel.activityCount > 30 ? 'highly engaged' : rel && rel.activityCount > 15 ? 'moderately engaged' : 'new'} follower whose interests in{' '}
              <strong>{follower.interests.slice(0, 2).join(' and ')}</strong> closely align with your mission.
              {rel && rel.activityCount > 30 ? ' Consider elevating this relationship — they could be a strong mission advocate.' : ''}
            </p>
          </div>
        </motion.div>
      </div>

      <CommunicationComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        recipientName={follower.name}
        context="custom"
      />
    </div>
  )
}
