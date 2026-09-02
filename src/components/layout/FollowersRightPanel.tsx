'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { MapPin, Lightning, Clock, Sparkle } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useFollowers } from '@/queries'
import { MOCK_TENANTS } from '@/data/mock/leaders'
import { formatRelativeTime } from '@/lib/formatting'

/** Compact follower counts: 1.2K / 3.4M. Matches the Followers page header. */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">{children}</h3>
  )
}

/**
 * Right panel for the Followers page.
 *
 * Deliberately different from the home panel: everything here is derived from
 * the follower list itself — where they are, what they care about, who engages
 * most, who arrived most recently — rather than repeating the briefing and
 * mission cards.
 */
export function FollowersRightPanel() {
  const { activeTenantId } = useAppStore()
  const { data: followers } = useFollowers(activeTenantId)
  const tenant = MOCK_TENANTS.find(t => t.id === activeTenantId)

  const list = useMemo(() => followers ?? [], [followers])

  /** Followers grouped by state, taken from the tail of "City, State". */
  const byState = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of list) {
      const state = f.location?.split(',').pop()?.trim()
      if (!state) continue
      counts.set(state, (counts.get(state) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [list])

  const topInterests = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of list) for (const i of f.interests ?? []) counts.set(i, (counts.get(i) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [list])

  const mostActive = useMemo(
    () =>
      [...list]
        .sort((a, b) => (b.leaderRelationships[0]?.activityCount ?? 0) - (a.leaderRelationships[0]?.activityCount ?? 0))
        .slice(0, 3),
    [list]
  )

  const newest = useMemo(
    () =>
      [...list]
        .sort(
          (a, b) =>
            new Date(b.leaderRelationships[0]?.followedAt ?? 0).getTime() -
            new Date(a.leaderRelationships[0]?.followedAt ?? 0).getTime()
        )
        .slice(0, 3),
    [list]
  )

  const total = tenant?.followerCount ?? 0
  const maxState = byState[0]?.[1] ?? 1

  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-0 h-screen py-6 pl-6 pr-3 overflow-y-auto scrollbar-none">

      {/* Headline count */}
      <section className="mb-6">
        <p className="text-4xl font-black tracking-tight text-foreground leading-none tabular-nums">
          {formatCount(total)}
        </p>
        <p className="mt-1.5 text-sm font-semibold text-foreground">Followers</p>
        <p className="text-xs text-muted-foreground">
          {total.toLocaleString('en-IN')} total
          {list.length > 0 && ` · ${list.length} profiled`}
        </p>
      </section>

      {/* Where they are */}
      {byState.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Where they are</SectionHeading>
          <div className="space-y-2">
            {byState.map(([state, n]) => (
              <div key={state}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="flex items-center gap-1.5 text-sm text-foreground truncate">
                    <MapPin size={12} weight="fill" className="text-muted-foreground shrink-0" />
                    {state}
                  </span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{n}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground/70"
                    style={{ width: `${Math.round((n / maxState) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* What they follow you for */}
      {topInterests.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Top interests</SectionHeading>
          <div className="flex flex-wrap gap-1.5">
            {topInterests.map(([interest, n]) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {interest}
                <span className="text-foreground/50 tabular-nums">{n}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Most engaged */}
      {mostActive.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Most engaged</SectionHeading>
          <div className="space-y-2">
            {mostActive.map(f => (
              <Link
                key={f.id}
                href={`/leader/followers/${f.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                {f.avatarUrl
                  ? <img src={f.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  : <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{f.name[0]}</span>}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-foreground truncate">{f.name}</span>
                  <span className="block text-xs text-muted-foreground truncate">{f.occupation ?? f.location}</span>
                </span>
                <span className="flex items-center gap-1 shrink-0 text-xs font-semibold text-foreground tabular-nums">
                  <Lightning size={11} weight="fill" className="text-amber-400" />
                  {f.leaderRelationships[0]?.activityCount ?? 0}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newest */}
      {newest.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Recently followed</SectionHeading>
          <div className="space-y-1">
            {newest.map(f => (
              <Link
                key={f.id}
                href={`/leader/followers/${f.id}`}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <Clock size={13} className="text-muted-foreground shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-foreground truncate">{f.name}</span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {f.leaderRelationships[0]?.followedAt
                      ? formatRelativeTime(f.leaderRelationships[0].followedAt)
                      : ''}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* A nudge that belongs on this page rather than the home briefing */}
      <section>
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="flex items-start gap-2">
            <Sparkle size={13} weight="fill" className="text-foreground/40 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {byState[0]
                ? `${byState[0][0]} is your strongest base with ${byState[0][1]} profiled follower${byState[0][1] > 1 ? 's' : ''}. Reach out to your most engaged there first.`
                : 'Profile your followers to see where your base is concentrated.'}
            </p>
          </div>
        </div>
      </section>
    </aside>
  )
}
