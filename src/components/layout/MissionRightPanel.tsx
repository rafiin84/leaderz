'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { CalendarBlank, Briefcase, Star, Users, MapPin, TrendUp, Target } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useMission, useEvents, useProjects, useOpportunities, useMissionUpdates } from '@/queries'
import { formatNumber, formatCurrency } from '@/lib/formatting'

function SectionHeading({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">{children}</h3>
      {href && <Link href={href} className="text-xs text-primary font-medium">See all</Link>}
    </div>
  )
}

/**
 * Right panel for the Mission page — mission figures rather than the home
 * briefing. Counts come from the live data, so they stay honest as the mock
 * data grows rather than being written in by hand.
 */
export function MissionRightPanel() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: mission } = useMission(activeTenantId)
  const { data: events } = useEvents(activeTenantId)
  const { data: projects } = useProjects(activeTenantId)
  const { data: opportunities } = useOpportunities(activeTenantId)
  const { data: updates } = useMissionUpdates(activeTenantId)

  const headline = useMemo(
    () => [
      { icon: CalendarBlank, label: 'Events', value: events?.length ?? 0, href: '/leader/events' },
      { icon: Briefcase, label: 'Companies', value: projects?.length ?? 0, href: '/leader/projects' },
      { icon: Star, label: 'Opportunities', value: opportunities?.length ?? 0, href: '/leader/opportunities' },
    ],
    [events, projects, opportunities]
  )

  const impact = mission?.impact

  /** States represented by located field updates. */
  const activeStates = useMemo(() => {
    const set = new Set<string>()
    for (const u of updates ?? []) {
      for (const p of u.photos ?? []) {
        if (p.metadata?.stateName) set.add(p.metadata.stateName)
      }
    }
    return [...set]
  }, [updates])

  if (!mission) return null

  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-0 h-screen py-6 pl-6 pr-3 overflow-y-auto scrollbar-none">

      {/* Mission identity */}
      <section className="mb-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground/40 uppercase tracking-wider">
          <Target size={12} weight="fill" />
          Your mission
        </span>
        <p className="mt-1.5 text-xl font-black tracking-tight text-foreground leading-tight">
          {mission.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {mission.statement}
        </p>
      </section>

      {/* The three headline counts */}
      <section className="mb-6">
        <div className="grid gap-2">
          {headline.map(({ icon: Icon, label, value, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
            >
              <span className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Icon size={16} weight="fill" className="text-foreground/70" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xl font-black text-foreground leading-none tabular-nums">
                  {formatNumber(value)}
                </span>
                <span className="block text-xs text-muted-foreground mt-0.5">{label}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Impact */}
      {impact && (
        <section className="mb-6">
          <SectionHeading href="/leader/mission">Impact</SectionHeading>
          <dl className="grid grid-cols-2 gap-2">
            {[
              { icon: Users, label: 'Reached', value: formatNumber(impact.peopleReached) },
              { icon: MapPin, label: 'Districts', value: impact.districtsActive },
              { icon: TrendUp, label: 'Activities', value: impact.activitiesCount },
              { icon: Users, label: 'Jobs', value: formatNumber(impact.jobsCreated) },
              { icon: Users, label: 'Students', value: formatNumber(impact.studentsSupported) },
              { icon: TrendUp, label: 'Funding', value: formatCurrency(impact.fundingFacilitated) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-2.5 rounded-xl border border-border bg-card">
                <dt className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Icon size={10} weight="fill" />
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm font-bold text-foreground tabular-nums truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Topics */}
      {mission.topics.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Topics</SectionHeading>
          <div className="flex flex-wrap gap-1.5">
            {mission.topics.map(t => (
              <span
                key={t.id}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {t.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Field activity */}
      <section>
        <SectionHeading>Field activity</SectionHeading>
        <div className="p-3 rounded-xl border border-border bg-card">
          <p className="text-sm font-bold text-foreground tabular-nums">
            {updates?.length ?? 0} update{(updates?.length ?? 0) === 1 ? '' : 's'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            {activeStates.length > 0
              ? `Logged across ${activeStates.length} state${activeStates.length > 1 ? 's' : ''}: ${activeStates.join(', ')}.`
              : 'Post an update with a photo to start mapping mission activity.'}
          </p>
        </div>
      </section>
    </aside>
  )
}
