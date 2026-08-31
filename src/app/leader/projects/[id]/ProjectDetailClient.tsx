'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Share, Heart, Users, CheckCircle, Sparkle, Link as LinkIcon, Trophy, BookOpen } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useProject } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { Skeleton } from '@/components/common/Skeleton'
import { formatNumber } from '@/lib/formatting'
import { cn } from '@/lib/utils'

const needTypeIcons: Record<string, React.ReactNode> = {
  funding: <span className="text-emerald-600">₹</span>,
  mentorship: '🧭',
  jobs: '💼',
  education: '🎓',
  partnership: '🤝',
  awareness: '📢',
  equipment: '⚙️',
}

export default function ProjectDetailClient() {
  const params = useParams()
  const router = useRouter()
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: project, isLoading } = useProject(activeTenantId, params.id as string)
  const [activeMedia, setActiveMedia] = useState(0)
  const [followed, setFollowed] = useState(false)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  if (!project) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Project not found</p></div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={20} /></button>
          <h1 className="text-base font-semibold flex-1 truncate">{project.title}</h1>
          <button className="p-2 rounded-xl hover:bg-muted transition-colors"><Share size={18} /></button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-5">
        {/* Hero */}
        <div className="rounded-2xl overflow-hidden border">
          <div className="relative h-60 bg-black">
            <img
              src={project.mediaItems[activeMedia]?.url ?? project.heroImageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-2xl font-bold text-white">{project.title}</h2>
              {project.tagline && <p className="text-white/80 text-sm mt-0.5">{project.tagline}</p>}
              <p className="text-white/60 text-xs mt-1 flex items-center gap-1"><MapPin size={11} weight="fill" />{project.location}</p>
            </div>
          </div>
          {/* Thumbnails */}
          {project.mediaItems.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-card border-t">
              {project.mediaItems.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMedia(i)}
                  className={cn('shrink-0 h-14 w-20 rounded-lg overflow-hidden ring-2 transition-all', i === activeMedia ? 'ring-primary' : 'ring-transparent')}
                >
                  <img src={m.url} alt={m.caption ?? ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats & actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart size={16} />
            <span>{formatNumber(project.followerCount)} following</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{project.viewCount.toLocaleString()} views</span>
          </div>
          <button
            onClick={() => setFollowed(f => !f)}
            className={cn('ml-auto px-4 py-2 rounded-xl text-sm font-medium transition-colors', followed ? 'bg-primary/10 text-primary' : 'bg-primary text-primary-foreground hover:bg-primary/90')}
          >
            {followed ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Leader action panel */}
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Leader actions</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: 'Ask Team to Review', color: 'border-primary/30 hover:bg-primary/5' },
              { label: 'Support', color: 'border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30' },
              { label: 'Fund', color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
              { label: 'Introduce', color: 'border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30' },
              { label: 'Amplify', color: 'border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30' },
              { label: 'Share', color: 'border-border hover:bg-muted' },
            ].map(action => (
              <button
                key={action.label}
                className={cn('py-2.5 rounded-xl border text-sm font-medium transition-colors', action.color)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="rounded-2xl border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Their story</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-primary mb-1">The problem</p>
              <p className="text-sm text-foreground leading-relaxed">{project.problem}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary mb-1">The solution</p>
              <p className="text-sm text-foreground leading-relaxed">{project.solution}</p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="rounded-2xl border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Team ({project.team.length})</h3>
          <div className="space-y-3">
            {project.team.map(member => (
              <div key={member.id} className="flex items-start gap-3">
                <Avatar src={member.avatarUrl} name={member.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="text-xs text-primary">{member.role}</p>
                  {member.bio && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{member.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-2xl border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Milestones</h3>
          <div className="space-y-3">
            {project.milestones.map((ms, i) => (
              <div key={ms.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0', ms.achieved ? 'bg-primary' : 'bg-muted border-2 border-border')}>
                    {ms.achieved && <CheckCircle size={12} className="text-primary-foreground" weight="fill" />}
                  </div>
                  {i < project.milestones.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1 min-h-4" />}
                </div>
                <div className={cn('pb-3 flex-1', !ms.achieved && 'opacity-60')}>
                  <p className={cn('text-sm font-medium', ms.achieved ? 'text-foreground' : 'text-muted-foreground')}>{ms.title}</p>
                  <p className="text-[10px] text-muted-foreground">{ms.date.slice(0, 7)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials */}
        {project.credentials.length > 0 && (
          <div className="rounded-2xl border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Credentials</h3>
            <div className="space-y-3">
              {project.credentials.map(cred => (
                <div key={cred.id} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 shrink-0">
                    <Trophy size={14} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cred.title}</p>
                    {cred.issuer && <p className="text-xs text-muted-foreground">{cred.issuer}</p>}
                    {cred.description && <p className="text-xs text-muted-foreground mt-0.5">{cred.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What they need */}
        {project.needs.length > 0 && (
          <div className="rounded-2xl border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 p-4">
            <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-3">What they need</h3>
            <div className="space-y-2">
              {project.needs.map((need, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-amber-950/40">
                  <span className="text-lg shrink-0">{needTypeIcons[need.type] ?? '•'}</span>
                  <div>
                    <p className="text-sm font-semibold">{need.label}</p>
                    {need.amount && <p className="text-sm text-primary font-bold">₹{(need.amount / 10000000).toFixed(1)} Cr</p>}
                    {need.description && <p className="text-xs text-muted-foreground mt-0.5">{need.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
