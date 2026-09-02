'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { CalendarBlank, Users, MapPin, TrendUp } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useEvents } from '@/queries'
import { formatNumber, formatShortDate } from '@/lib/formatting'
import { PanelShell, PanelHeading, PanelHeadline, StatTile, BreakdownRow, tally } from './panelPrimitives'

/**
 * Right panel for the Events page — event figures rather than the home
 * briefing. Everything is derived from the event list.
 */
export function EventsRightPanel() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: events } = useEvents(activeTenantId)
  const list = useMemo(() => events ?? [], [events])

  const totals = useMemo(() => {
    let participants = 0
    let activities = 0
    for (const e of list) {
      participants += e.participantCount ?? 0
      activities += e.localActivities?.length ?? 0
    }
    return { participants, activities }
  }, [list])

  const byStatus = useMemo(() => tally(list, e => e.status), [list])
  const byState = useMemo(() => tally(list, e => e.stateName), [list])

  const upcoming = useMemo(
    () =>
      [...list]
        .filter(e => e.status === 'upcoming' || e.isOngoing)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3),
    [list]
  )

  const maxStatus = byStatus[0]?.[1] ?? 1
  const maxState = byState[0]?.[1] ?? 1

  return (
    <PanelShell>
      <PanelHeadline
        value={list.length}
        label={list.length === 1 ? 'Event' : 'Events'}
        detail={`${formatNumber(totals.participants)} participants in total`}
      />

      <section className="mb-6">
        <PanelHeading>At a glance</PanelHeading>
        <dl className="grid grid-cols-2 gap-2">
          <StatTile icon={Users} label="Participants" value={formatNumber(totals.participants)} />
          <StatTile icon={TrendUp} label="Local activities" value={totals.activities} />
          <StatTile icon={MapPin} label="States" value={byState.length} />
          <StatTile icon={CalendarBlank} label="Ongoing" value={list.filter(e => e.isOngoing).length} />
        </dl>
      </section>

      {byStatus.length > 0 && (
        <section className="mb-6">
          <PanelHeading>By status</PanelHeading>
          <div className="space-y-2">
            {byStatus.map(([status, n]) => (
              <BreakdownRow key={status} label={status} count={n} max={maxStatus} />
            ))}
          </div>
        </section>
      )}

      {byState.length > 0 && (
        <section className="mb-6">
          <PanelHeading>By state</PanelHeading>
          <div className="space-y-2">
            {byState.map(([state, n]) => (
              <BreakdownRow key={state} label={state} count={n} max={maxState} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <PanelHeading>Coming up</PanelHeading>
          <div className="space-y-2">
            {upcoming.map(e => (
              <Link
                key={e.id}
                href={`/leader/events/${e.id}`}
                className="block p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{e.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {e.isOngoing ? 'Ongoing' : formatShortDate(e.date)}
                  {e.stateName ? ` · ${e.stateName}` : ''}
                  {` · ${formatNumber(e.participantCount ?? 0)} joined`}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PanelShell>
  )
}
