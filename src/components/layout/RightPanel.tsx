'use client'
import { useAppStore } from '@/stores/appStore'
import {
  useFollowers, useAISuggestions, useEvents, useUpcomingBirthdays,
  useMission, useProjects, useFollowUps,
} from '@/queries'
import Link from 'next/link'
import { Phone, Lightning, CalendarBlank, Cake, Target, Sparkle } from '@phosphor-icons/react'
import { formatNumber, formatShortDate } from '@/lib/formatting'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'

const MOCK_PHONES: Record<string, string> = {
  'f-01': '+917010012345',
  'f-05': '+917010098765',
  'f-07': '+917010054321',
  'f-08': '+917010011111',
  'f-04': '+917010022222',
}

function SectionHeading({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">{children}</h3>
      {href && <Link href={href} className="text-xs text-primary font-medium">See all</Link>}
    </div>
  )
}

export function RightPanel() {
  const { activeTenantId, userRole } = useAppStore()
  const { data: followers } = useFollowers(activeTenantId)
  const { data: suggestions } = useAISuggestions(activeTenantId)
  const { data: events } = useEvents(activeTenantId)
  const { data: birthdays } = useUpcomingBirthdays(activeTenantId, userRole)
  const { data: followUps } = useFollowUps(activeTenantId, userRole)
  const { data: mission } = useMission(activeTenantId)
  const { data: projects } = useProjects(activeTenantId)

  const topFollowers = [...(followers ?? [])]
    .sort((a, b) => (b.leaderRelationships[0]?.activityCount ?? 0) - (a.leaderRelationships[0]?.activityCount ?? 0))
    .slice(0, 3)

  const live = (suggestions ?? []).filter(s => !s.dismissed)
  const briefing = live.filter(s => s.type === 'briefing').slice(0, 1)
  const relationship = live.filter(s => s.type === 'relationship').slice(0, 2)
  const upcomingEvents = (events ?? []).filter(e => e.status === 'upcoming').slice(0, 2)
  const upcomingBirthdays = (birthdays ?? []).slice(0, 2)
  const pendingFollowUps = (followUps ?? []).slice(0, 2)

  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-0 h-screen py-6 pl-6 pr-3 overflow-y-auto scrollbar-none">

      {/* Today's briefing */}
      {briefing.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Today&rsquo;s briefing</SectionHeading>
          {briefing.map(s => (
            <div key={s.id} className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-2">
                <Sparkle size={13} weight="fill" className="text-foreground/40 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  {/* No title here: it would repeat the section heading above. */}
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Needs attention — birthdays and follow-ups */}
      {(upcomingBirthdays.length > 0 || pendingFollowUps.length > 0) && (
        <section className="mb-6">
          <SectionHeading>Needs attention</SectionHeading>
          <div className="space-y-2">
            {upcomingBirthdays.map(c => (
              <Link
                key={`bday-${c.id}`}
                href={`/leader/contacts/${c.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                <Cake size={15} weight="fill" className="text-rose-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Birthday {formatShortDate(c.importantDates[0]?.date ?? '')}
                  </p>
                </div>
              </Link>
            ))}
            {pendingFollowUps.map(c => (
              <Link
                key={`fu-${c.id}`}
                href={`/leader/contacts/${c.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                <Lightning size={15} weight="fill" className="text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.nextFollowUpNote ?? 'Follow up needed'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mission */}
      {mission && (
        <section className="mb-6">
          <SectionHeading href="/leader/mission">Your mission</SectionHeading>
          <Link href="/leader/mission" className="block rounded-xl border border-border bg-card overflow-hidden hover:bg-muted/30 transition-colors">
            <div className="relative h-16 overflow-hidden">
              {mission.coverImageUrl && (
                <ImageWithFallback src={mission.coverImageUrl} fallbackSrc="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop" alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/10" />
              <div className="absolute inset-0 px-3 flex items-center gap-2">
                <Target size={15} weight="fill" className="text-white shrink-0" />
                <p className="text-sm font-bold text-white leading-tight">{mission.title}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-y-2 p-3">
              {[
                { label: 'Followers', value: formatNumber(mission.impact.peopleReached) },
                { label: 'Districts', value: mission.impact.districtsActive },
                { label: 'Activities', value: mission.impact.activitiesCount },
                { label: 'Companies', value: mission.impact.projectsDiscovered },
              ].map(stat => (
                <div key={stat.label}>
                  <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
                  <dd className="text-sm font-bold text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Link>
        </section>
      )}

      {/* Relationship insights */}
      {relationship.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Relationship insights</SectionHeading>
          <div className="space-y-2">
            {relationship.map(s => (
              <Link
                key={s.id}
                href={s.targetType === 'contact' ? `/leader/contacts/${s.targetId}` : '/leader/home'}
                className="block p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Lightning size={13} weight="fill" className="text-amber-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{s.body}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Discovered companies */}
      {projects && projects.length > 0 && (
        <section className="mb-6">
          <SectionHeading href="/leader/projects">Discovered</SectionHeading>
          <div className="space-y-1">
            {projects.slice(0, 3).map(project => (
              <Link
                key={project.id}
                href={`/leader/projects/${project.id}`}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <img
                  src={project.heroImageUrl}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{project.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Coming up */}
      {upcomingEvents.length > 0 && (
        <section className="mb-6">
          <SectionHeading href="/leader/events">Coming up</SectionHeading>
          <div className="space-y-1">
            {upcomingEvents.map(e => (
              <Link
                key={e.id}
                href={`/leader/events/${e.id}`}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <CalendarBlank size={15} weight="fill" className="text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top engagers */}
      {topFollowers.length > 0 && (
        <section>
          <SectionHeading>Top engagers</SectionHeading>
          <div className="space-y-1">
            {topFollowers.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-muted/40 transition-colors group">
                {f.avatarUrl
                  ? <img src={f.avatarUrl} alt={f.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{f.name[0]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{f.occupation ?? f.location}</p>
                </div>
                {MOCK_PHONES[f.id] && (
                  <a
                    href={`tel:${MOCK_PHONES[f.id]}`}
                    className="shrink-0 p-1.5 rounded-full bg-foreground/[0.06] text-foreground hover:bg-foreground/12 transition-colors"
                    title="Call"
                  >
                    <Phone size={13} weight="fill" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  )
}
