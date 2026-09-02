'use client'
import { useMemo } from 'react'
import { Star, Clock, MapPin, CheckCircle } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useOpportunities } from '@/queries'
import { formatShortDate } from '@/lib/formatting'
import { PanelShell, PanelHeading, PanelHeadline, StatTile, BreakdownRow, tally } from './panelPrimitives'

/**
 * Right panel for the Opportunities page: what is open, of what kind, and
 * what closes soonest. All derived from the opportunity list.
 */
export function OpportunitiesRightPanel() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: opportunities } = useOpportunities(activeTenantId)
  const list = useMemo(() => opportunities ?? [], [opportunities])

  const open = useMemo(() => list.filter(o => o.status === 'open'), [list])
  const remote = useMemo(() => list.filter(o => o.isRemote).length, [list])
  const byType = useMemo(() => tally(list, o => o.type), [list])
  const byOrg = useMemo(() => tally(list, o => o.organization), [list])

  /** Soonest deadlines among the still-open ones. Keyed off `status` rather
   *  than comparing against Date.now(), which is impure during render. */
  const closingSoon = useMemo(
    () =>
      list
        .filter(o => o.status === 'open' && o.deadline)
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        .slice(0, 3),
    [list]
  )

  const maxType = byType[0]?.[1] ?? 1

  return (
    <PanelShell>
      <PanelHeadline
        value={list.length}
        label={list.length === 1 ? 'Opportunity' : 'Opportunities'}
        detail={`${open.length} currently open`}
      />

      <section className="mb-6">
        <PanelHeading>At a glance</PanelHeading>
        <dl className="grid grid-cols-2 gap-2">
          <StatTile icon={CheckCircle} label="Open" value={open.length} />
          <StatTile icon={Star} label="Types" value={byType.length} />
          <StatTile icon={MapPin} label="Remote" value={remote} />
          <StatTile icon={Clock} label="With deadline" value={list.filter(o => o.deadline).length} />
        </dl>
      </section>

      {byType.length > 0 && (
        <section className="mb-6">
          <PanelHeading>By type</PanelHeading>
          <div className="space-y-2">
            {byType.map(([type, n]) => (
              <BreakdownRow key={type} label={type} count={n} max={maxType} />
            ))}
          </div>
        </section>
      )}

      {closingSoon.length > 0 && (
        <section className="mb-6">
          <PanelHeading>Closing soonest</PanelHeading>
          <div className="space-y-2">
            {closingSoon.map(o => (
              <div key={o.id} className="p-3 rounded-xl border border-border bg-card">
                <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{o.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {o.organization}
                  {o.deadline ? ` · closes ${formatShortDate(o.deadline)}` : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {byOrg.length > 0 && (
        <section>
          <PanelHeading>Offered by</PanelHeading>
          <div className="flex flex-wrap gap-1.5">
            {byOrg.slice(0, 8).map(([org, n]) => (
              <span
                key={org}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {org}
                {n > 1 && <span className="text-foreground/50 tabular-nums">{n}</span>}
              </span>
            ))}
          </div>
        </section>
      )}
    </PanelShell>
  )
}
