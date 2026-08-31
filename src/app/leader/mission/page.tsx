'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Users, MapPin, TrendUp, Briefcase, Star, CalendarBlank } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useMission, useInitiatives, useEvents, useProjects } from '@/queries'
import { InitiativeCard } from '@/components/mission/InitiativeCard'
import { OpportunityCard } from '@/components/opportunities/OpportunityCard'
import { Skeleton } from '@/components/common/Skeleton'
import { formatNumber, formatCurrency } from '@/lib/formatting'
import Link from 'next/link'

export default function MissionPage() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: mission, isLoading } = useMission(activeTenantId)
  const { data: initiatives } = useInitiatives(activeTenantId)
  const { data: events } = useEvents(activeTenantId)
  const { data: projects } = useProjects(activeTenantId)
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)

  if (isLoading || !mission) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  const activeTopic = mission.topics.find(t => t.id === activeTopicId)

  const impactStats = [
    { label: 'People reached', value: formatNumber(mission.impact.peopleReached), icon: Users },
    { label: 'Districts', value: mission.impact.districtsActive, icon: MapPin },
    { label: 'Activities', value: mission.impact.activitiesCount, icon: TrendUp },
    { label: 'Projects', value: mission.impact.projectsDiscovered, icon: Briefcase },
    { label: 'Jobs created', value: formatNumber(mission.impact.jobsCreated), icon: Star },
    { label: 'Funding', value: formatCurrency(mission.impact.fundingFacilitated), icon: TrendUp },
    { label: 'Students', value: formatNumber(mission.impact.studentsSupported), icon: Users },
    { label: 'Orgs involved', value: mission.impact.organizationsInvolved, icon: Users },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Target size={20} className="text-primary" weight="fill" />
          <h1 className="text-xl font-bold text-foreground flex-1">Mission</h1>
          <Link href="/leader/events" className="text-xs text-primary font-medium">Events</Link>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Mission hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden border bg-card">
          {mission.coverImageUrl && (
            <div className="relative h-48 overflow-hidden">
              <img src={mission.coverImageUrl} alt={mission.title} className="w-full h-full object-cover" />
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
        </motion.div>

        {/* Topics */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Topics</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTopicId(null)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-colors ${!activeTopicId ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              All
            </button>
            {mission.topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id === activeTopicId ? null : topic.id)}
                className="text-sm px-4 py-2 rounded-full font-medium transition-all hover:opacity-90"
                style={topic.id === activeTopicId ? { backgroundColor: topic.color ?? '#1a6b3c', color: 'white' } : { backgroundColor: topic.color ? topic.color + '20' : '#f0fdf4', color: topic.color ?? '#1a6b3c' }}
              >
                {topic.name}
              </button>
            ))}
          </div>

          {activeTopic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 rounded-xl bg-muted text-sm text-muted-foreground"
            >
              {activeTopic.description}
              <div className="flex gap-4 mt-2 text-xs">
                <span>{formatNumber(activeTopic.postCount)} posts</span>
                <span>{activeTopic.eventCount} events</span>
                <span>{formatNumber(activeTopic.followerCount)} followers</span>
              </div>
            </motion.div>
          )}
        </section>

        {/* Initiatives */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Initiatives</h2>
            <Link href="/leader/events" className="text-xs text-primary font-medium">Events</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {initiatives?.map((init, i) => (
              <InitiativeCard key={init.id} initiative={init} index={i} />
            ))}
          </div>
        </section>

        {/* Geography */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Geographic focus</h2>
          <div className="rounded-2xl border bg-card p-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Tamil Nadu', districts: 14, events: 3, projects: 4, color: '#059669' },
                { name: 'Karnataka', districts: 3, events: 1, projects: 1, color: '#d97706' },
                { name: 'Andhra Pradesh', districts: 2, events: 0, projects: 0, color: '#7c3aed' },
              ].map(state => (
                <Link
                  key={state.name}
                  href={`/leader/events?state=${state.name}`}
                  className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: state.color }} />
                    <p className="text-sm font-semibold">{state.name}</p>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>{state.districts} districts active</p>
                    <p>{state.events} events · {state.projects} projects</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Impact */}
        <section>
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

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Projects & Talent</h2>
              <Link href="/leader/projects" className="text-xs text-primary font-medium">See all</Link>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 2).map(project => (
                <Link
                  key={project.id}
                  href={`/leader/projects/${project.id}`}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3 card-hover hover:shadow-md transition-all"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                    <img src={project.heroImageUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{project.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.location}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{project.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
