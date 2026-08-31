'use client'
import { useAppStore } from '@/stores/appStore'
import { useFollowers, useAISuggestions, useEvents, useUpcomingBirthdays } from '@/queries'
import Link from 'next/link'
import { Phone, Lightning, CalendarBlank, Cake } from '@phosphor-icons/react'

const MOCK_PHONES: Record<string, string> = {
  'f-01': '+917010012345',
  'f-05': '+917010098765',
  'f-07': '+917010054321',
  'f-08': '+917010011111',
  'f-04': '+917010022222',
}

export function RightPanel() {
  const { activeTenantId, userRole } = useAppStore()
  const { data: followers } = useFollowers(activeTenantId)
  const { data: suggestions } = useAISuggestions(activeTenantId)
  const { data: events } = useEvents(activeTenantId)
  const { data: birthdays } = useUpcomingBirthdays(activeTenantId, userRole)

  const topFollowers = [...(followers ?? [])]
    .sort((a, b) => (b.leaderRelationships[0]?.activityCount ?? 0) - (a.leaderRelationships[0]?.activityCount ?? 0))
    .slice(0, 3)

  const highPriority = (suggestions ?? []).filter(s => s.priority === 'high' && !s.dismissed).slice(0, 2)
  const upcomingEvents = (events ?? []).filter(e => e.status === 'upcoming').slice(0, 2)
  const upcomingBirthdays = (birthdays ?? []).slice(0, 2)

  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-0 h-screen py-6 pl-6 pr-3 overflow-y-auto scrollbar-none border-l border-border/50">

      {/* Action needed */}
      {highPriority.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">Action needed</h3>
          <div className="space-y-2">
            {highPriority.map(s => (
              <Link
                key={s.id}
                href={s.targetType === 'contact' ? `/leader/contacts/${s.targetId}` : '/leader/home'}
                className="block p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <Lightning size={13} weight="fill" className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.body}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Coming up */}
      {(upcomingBirthdays.length > 0 || upcomingEvents.length > 0) && (
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">Coming up</h3>
          <div className="space-y-1">
            {upcomingBirthdays.map(c => (
              <Link
                key={c.id}
                href={`/leader/contacts/${c.id}`}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <Cake size={15} weight="fill" className="text-rose-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Birthday {c.importantDates[0]?.date
                      ? new Date(c.importantDates[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : ''}
                  </p>
                </div>
              </Link>
            ))}
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
          <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">Top engagers</h3>
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
                    className="shrink-0 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-foreground/5 transition-all"
                    title="Call"
                  >
                    <Phone size={13} weight="fill" className="text-foreground/60" />
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
