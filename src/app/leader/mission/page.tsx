'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Target, Plus, ArrowsOut, MapPin, Users, CalendarBlank, Briefcase, Star,
  TrendUp, FilmStrip, Article,
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import {
  useMission, useInitiatives, useEvents, useProjects, useOpportunities,
  useMissionUpdates, useRemoveMissionUpdate, usePosts, useReels,
} from '@/queries'
import { InitiativeCard } from '@/components/mission/InitiativeCard'
import { OpportunityCard } from '@/components/opportunities/OpportunityCard'
import { MissionUpdateDialog } from '@/components/mission/MissionUpdateDialog'
import { MissionUpdateCard } from '@/components/mission/MissionUpdateCard'
import { MissionMapView } from '@/components/mission/MissionMapView'
import { MissionMap } from '@/components/mission/MissionMap'
import { JoinMissionCta } from '@/components/mission/JoinMissionCta'
import { MissionLongDescription } from '@/components/mission/MissionLongDescription'
import { PostCard } from '@/components/content/PostCard'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { formatNumber, formatCurrency, formatDate, formatDuration } from '@/lib/formatting'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'events', label: 'Events' },
  { id: 'posts', label: 'Posts' },
  { id: 'reels', label: 'Reels' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'opportunities', label: 'Opportunities' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function MissionPage() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: mission, isLoading } = useMission(activeTenantId)
  const { data: initiatives } = useInitiatives(activeTenantId)
  const { data: events } = useEvents(activeTenantId)
  const { data: projects } = useProjects(activeTenantId)
  const { data: opportunities } = useOpportunities(activeTenantId)
  const { data: posts } = usePosts(activeTenantId)
  const { data: reels } = useReels(activeTenantId)
  const { data: updates } = useMissionUpdates(activeTenantId)
  const removeUpdate = useRemoveMissionUpdate(activeTenantId)

  const [tab, setTab] = useState<TabId>('details')
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [mapExpanded, setMapExpanded] = useState(false)

  /** Posts and reels carrying this mission's tag. */
  const missionPosts = useMemo(
    () => (posts ?? []).filter(p => p.missionId === mission?.id || p.missionTitle === mission?.title),
    [posts, mission]
  )
  const missionReels = useMemo(
    () => (reels ?? []).filter(r => r.missionId === mission?.id || r.missionTitle === mission?.title),
    [reels, mission]
  )

  const counts: Record<TabId, number | undefined> = {
    details: undefined,
    events: events?.length,
    posts: missionPosts.length,
    reels: missionReels.length,
    organizations: projects?.length,
    opportunities: opportunities?.length,
  }

  if (isLoading || !mission) {
    return (
      <div className="px-4 py-6 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    )
  }

  const impactStats = [
    { label: 'People reached', value: formatNumber(mission.impact.peopleReached), icon: Users },
    { label: 'Districts', value: mission.impact.districtsActive, icon: MapPin },
    { label: 'Activities', value: mission.impact.activitiesCount, icon: TrendUp },
    { label: 'Companies', value: mission.impact.projectsDiscovered, icon: Briefcase },
    { label: 'Jobs created', value: formatNumber(mission.impact.jobsCreated), icon: Star },
    { label: 'Funding', value: formatCurrency(mission.impact.fundingFacilitated), icon: TrendUp },
    { label: 'Students', value: formatNumber(mission.impact.studentsSupported), icon: Users },
    { label: 'Organisations', value: mission.impact.organizationsInvolved, icon: Users },
  ]

  return (
    <div>
      {/* Header + tabs */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Target size={20} className="text-primary shrink-0" weight="fill" />
          <h1 className="text-xl font-bold text-foreground flex-1 truncate">Mission</h1>
          <button
            onClick={() => setUpdateDialogOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} weight="bold" />
            Add update
          </button>
        </div>

        {/* One line, scrolled horizontally — the tab set is long enough to
            wrap onto two rows otherwise. */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={cn(
                'shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors whitespace-nowrap',
                tab === t.id
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-foreground/60 border-border hover:bg-muted hover:text-foreground'
              )}
            >
              {t.label}
              {counts[t.id] !== undefined && (
                <span className={cn('tabular-nums', tab === t.id ? 'text-background/70' : 'text-foreground/40')}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {tab === 'details' && (
          <>
            {/* Banner */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden border bg-card">
              {mission.coverImageUrl && (
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback src={mission.coverImageUrl} fallbackSrc="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop" alt={mission.title} className="w-full h-full object-cover object-[50%_30%]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-2xl font-bold text-white">{mission.title}</h2>
                  </div>
                </div>
              )}
              <div className="p-4">
                <p className="text-sm text-foreground leading-relaxed mb-3">{mission.statement}</p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">{mission.vision}</p>
              </div>
            </motion.section>

            {/* The map is the heart of the page, so it sits inline under the
                banner rather than behind a button. Expand opens the full view. */}
            {/* High on the page: at the bottom it sat below the map, the
                impact grid and the field updates, so nobody reached it. */}
            <JoinMissionCta missionTitle={mission.title} supporterCount={mission.impact.peopleReached} />

            {/* Aligned with the other sections rather than full-bleed. */}
            <section aria-label="Mission map">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Mission across India
              </h2>
              <div className="relative rounded-2xl border overflow-hidden">
                <MissionMap
                  updates={updates ?? []}
                  className="relative h-[320px] sm:h-[440px] bg-muted"
                />
                {/* Full-screen view is a corner affordance on the map itself,
                    so the section reads as a map rather than as a button. */}
                <button
                  onClick={() => setMapExpanded(true)}
                  aria-label="Expand map to full screen"
                  title="Expand map"
                  className="absolute top-2.5 right-2.5 z-10 p-2 rounded-lg bg-card/95 backdrop-blur-sm border shadow-sm text-foreground/70 hover:text-foreground hover:bg-card transition-colors"
                >
                  <ArrowsOut size={15} weight="bold" />
                </button>
              </div>
            </section>

            {mission.longDescription && mission.longDescription.length > 0 && (
              <section aria-label="About this mission" className="rounded-2xl border bg-card p-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  About this mission
                </h2>
                <MissionLongDescription sections={mission.longDescription} />
              </section>
            )}

            {/* Topics and Impact live in the right panel, but that panel is
                xl-only — so they stay here below xl rather than vanishing on
                phones and tablets. */}
            <section className="xl:hidden">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Topics</h2>
              <div className="flex gap-2 flex-wrap">
                {mission.topics.map(topic => (
                  <span
                    key={topic.id}
                    className="text-sm px-4 py-2 rounded-full font-medium"
                    style={{
                      backgroundColor: topic.color ? topic.color + '20' : '#f0fdf4',
                      color: topic.color ?? '#1a6b3c',
                    }}
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
            </section>

            {/* Impact */}
            <section className="xl:hidden">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Impact snapshot</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {impactStats.map(stat => (
                  <div key={stat.label} className="rounded-2xl border bg-card p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Labelled "Events" per request; the cards are Initiative
                records, which is a distinct type from Event. */}
            {initiatives && initiatives.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Events</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {initiatives.map((init, i) => <InitiativeCard key={init.id} initiative={init} index={i} />)}
                </div>
              </section>
            )}

            {/* Field updates */}
            <section aria-label="Field updates">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Field updates</h2>
              {updates && updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map(u => <MissionUpdateCard key={u.id} update={u} onRemove={removeUpdate} />)}
                </div>
              ) : (
                <button
                  onClick={() => setUpdateDialogOpen(true)}
                  className="w-full rounded-2xl border border-dashed p-5 text-left hover:bg-muted/40 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">Log a field update</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Take or choose a photo — location, capture time and camera details are read from
                    the photo automatically where available.
                  </p>
                </button>
              )}
            </section>

          </>
        )}

        {tab === 'events' && (
          events && events.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {events.map(event => (
                <Link
                  key={event.id}
                  href={`/leader/events/${event.id}`}
                  className="block rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-all"
                >
                  {event.coverImageUrl && (
                    <div className="relative h-36 overflow-hidden">
                      <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <h3 className="absolute bottom-3 left-3 right-3 text-base font-bold text-white">{event.title}</h3>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin size={11} />{event.stateName}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{formatNumber(event.participantCount)}</span>
                      <span className="flex items-center gap-1">
                        <CalendarBlank size={11} />{event.isOngoing ? 'Ongoing' : formatDate(event.date)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<CalendarBlank size={44} />} title="No events yet" description="Mission events will appear here." />
          )
        )}

        {tab === 'posts' && (
          missionPosts.length > 0 ? (
            <div className="space-y-4">
              {missionPosts.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          ) : (
            <EmptyState icon={<Article size={44} />} title="No mission posts yet" description="Posts tagged to this mission will appear here." />
          )
        )}

        {tab === 'reels' && (
          missionReels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {missionReels.map(r => (
                <Link
                  key={r.id}
                  href="/leader/reels"
                  className="relative block aspect-[9/16] rounded-2xl overflow-hidden border bg-muted group"
                >
                  {r.posterUrl && (
                    <img src={r.posterUrl} alt={r.caption ?? ''} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[11px] text-white line-clamp-2 leading-snug">{r.caption}</p>
                    <p className="mt-1 text-[10px] text-white/70 tabular-nums">
                      {formatNumber(r.viewCount ?? 0)} views · {formatDuration(r.duration ?? 0)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<FilmStrip size={44} />} title="No mission reels yet" description="Reels tagged to this mission will appear here." />
          )
        )}

        {tab === 'organizations' && (
          projects && projects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map(project => (
                <Link
                  key={project.id}
                  href={`/leader/projects/${project.id}`}
                  className="block rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="h-36 overflow-hidden">
                    <img src={project.heroImageUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground">{project.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.location}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Briefcase size={44} />} title="No organisations yet" description="Companies discovered through the mission will appear here." />
          )
        )}

        {tab === 'opportunities' && (
          opportunities && opportunities.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {opportunities.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />)}
            </div>
          ) : (
            <EmptyState icon={<Star size={44} />} title="No opportunities yet" description="Opportunities linked to this mission will appear here." />
          )
        )}
      </div>

      <MissionUpdateDialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} />
      <MissionMapView open={mapExpanded} onClose={() => setMapExpanded(false)} updates={updates ?? []} />
    </div>
  )
}
