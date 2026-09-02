'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { Briefcase, Users, MapPin, Eye, Handshake } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useProjects } from '@/queries'
import { formatNumber } from '@/lib/formatting'
import { PanelShell, PanelHeading, PanelHeadline, StatTile, BreakdownRow, tally } from './panelPrimitives'

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  seeking_support: 'Seeking support',
  funded: 'Funded',
  completed: 'Completed',
}

/**
 * Right panel for the Companies page. Figures come from the discovered
 * companies themselves — where they are, what stage they are at, what they
 * are asking for.
 */
export function CompaniesRightPanel() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: projects } = useProjects(activeTenantId)
  const list = useMemo(() => projects ?? [], [projects])

  const totals = useMemo(() => {
    let followers = 0, views = 0, team = 0, needs = 0
    for (const p of list) {
      followers += p.followerCount ?? 0
      views += p.viewCount ?? 0
      team += p.team?.length ?? 0
      needs += p.needs?.length ?? 0
    }
    return { followers, views, team, needs }
  }, [list])

  const byStatus = useMemo(() => tally(list, p => p.status), [list])
  const byState = useMemo(() => tally(list, p => p.stateName ?? p.location?.split(',').pop()?.trim()), [list])
  const seekingSupport = useMemo(() => list.filter(p => p.status === 'seeking_support'), [list])

  const maxStatus = byStatus[0]?.[1] ?? 1
  const maxState = byState[0]?.[1] ?? 1

  return (
    <PanelShell>
      <PanelHeadline
        value={list.length}
        label={list.length === 1 ? 'Company' : 'Companies'}
        detail={`${formatNumber(totals.team)} people across their teams`}
      />

      <section className="mb-6">
        <PanelHeading>At a glance</PanelHeading>
        <dl className="grid grid-cols-2 gap-2">
          <StatTile icon={Users} label="Followers" value={formatNumber(totals.followers)} />
          <StatTile icon={Eye} label="Profile views" value={formatNumber(totals.views)} />
          <StatTile icon={MapPin} label="States" value={byState.length} />
          <StatTile icon={Handshake} label="Open needs" value={totals.needs} />
        </dl>
      </section>

      {byStatus.length > 0 && (
        <section className="mb-6">
          <PanelHeading>By stage</PanelHeading>
          <div className="space-y-2">
            {byStatus.map(([status, n]) => (
              <BreakdownRow key={status} label={STATUS_LABELS[status] ?? status} count={n} max={maxStatus} />
            ))}
          </div>
        </section>
      )}

      {byState.length > 0 && (
        <section className="mb-6">
          <PanelHeading>Where they are</PanelHeading>
          <div className="space-y-2">
            {byState.map(([state, n]) => (
              <BreakdownRow key={state} label={state} count={n} max={maxState} />
            ))}
          </div>
        </section>
      )}

      {seekingSupport.length > 0 && (
        <section>
          <PanelHeading>Asking for support</PanelHeading>
          <div className="space-y-2">
            {seekingSupport.map(p => (
              <Link
                key={p.id}
                href={`/leader/projects/${p.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                {p.heroImageUrl
                  ? <img src={p.heroImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  : <span className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0"><Briefcase size={15} /></span>}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-foreground truncate">{p.title}</span>
                  <span className="block text-[11px] text-muted-foreground truncate">
                    {p.needs?.length ? `${p.needs.length} need${p.needs.length > 1 ? 's' : ''}` : p.location}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PanelShell>
  )
}
