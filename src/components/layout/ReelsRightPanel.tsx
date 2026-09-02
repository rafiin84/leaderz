'use client'
import { useMemo } from 'react'
import { Eye, Heart, ChatCircle, Share, Clock, FilmStrip } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useReels } from '@/queries'
import { formatNumber, formatDuration } from '@/lib/formatting'

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">{children}</h3>
  )
}

/**
 * Right panel for the Reels page.
 *
 * Reel-specific rather than the home briefing: total reels and reach, the
 * engagement split, the best performing reels, and how they break down by
 * topic. Every figure is aggregated from the reel list itself.
 */
export function ReelsRightPanel() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: reels } = useReels(activeTenantId)

  const list = useMemo(() => reels ?? [], [reels])

  const totals = useMemo(() => {
    let views = 0, reactions = 0, comments = 0, shares = 0, seconds = 0
    for (const r of list) {
      views += r.viewCount ?? 0
      comments += r.commentCount ?? 0
      shares += r.shareCount ?? 0
      seconds += r.duration ?? 0
      for (const re of r.reactions ?? []) reactions += re.count
    }
    return { views, reactions, comments, shares, seconds }
  }, [list])

  const topReels = useMemo(
    () => [...list].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)).slice(0, 3),
    [list]
  )

  const byTopic = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of list) {
      if (!r.topicName) continue
      counts.set(r.topicName, (counts.get(r.topicName) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [list])

  const maxViews = topReels[0]?.viewCount ?? 1

  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-0 h-screen py-6 pl-6 pr-3 overflow-y-auto scrollbar-none">

      {/* Headline */}
      <section className="mb-6">
        <p className="text-4xl font-black tracking-tight text-foreground leading-none tabular-nums">
          {list.length}
        </p>
        <p className="mt-1.5 text-sm font-semibold text-foreground">
          {list.length === 1 ? 'Reel' : 'Reels'} published
        </p>
        <p className="text-xs text-muted-foreground">
          {formatNumber(totals.views)} total views
          {totals.seconds > 0 && ` · ${formatDuration(totals.seconds)} of footage`}
        </p>
      </section>

      {/* Engagement split */}
      <section className="mb-6">
        <SectionHeading>Engagement</SectionHeading>
        <dl className="grid grid-cols-2 gap-2">
          {[
            { icon: Eye, label: 'Views', value: formatNumber(totals.views) },
            { icon: Heart, label: 'Reactions', value: formatNumber(totals.reactions) },
            { icon: ChatCircle, label: 'Comments', value: formatNumber(totals.comments) },
            { icon: Share, label: 'Shares', value: formatNumber(totals.shares) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-xl border border-border bg-card">
              <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Icon size={11} weight="fill" />
                {label}
              </dt>
              <dd className="mt-0.5 text-base font-bold text-foreground tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Top reels */}
      {topReels.length > 0 && (
        <section className="mb-6">
          <SectionHeading>Top reels</SectionHeading>
          <ol className="space-y-2">
            {topReels.map((r, i) => (
              <li key={r.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
                <span className="relative shrink-0">
                  {r.posterUrl
                    ? <img src={r.posterUrl} alt="" className="w-11 h-14 rounded-lg object-cover" />
                    : <span className="w-11 h-14 rounded-lg bg-muted flex items-center justify-center"><FilmStrip size={16} /></span>}
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs text-foreground line-clamp-2 leading-snug">
                    {r.caption ?? 'Untitled reel'}
                  </span>
                  <span className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground tabular-nums">
                    <Eye size={10} weight="fill" />
                    {formatNumber(r.viewCount ?? 0)}
                    {r.duration ? <span className="text-foreground/30">· {formatDuration(r.duration)}</span> : null}
                  </span>
                  <span className="block mt-1 h-1 rounded-full bg-muted overflow-hidden">
                    <span
                      className="block h-full rounded-full bg-foreground/60"
                      style={{ width: `${Math.round(((r.viewCount ?? 0) / maxViews) * 100)}%` }}
                    />
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Topic mix */}
      {byTopic.length > 0 && (
        <section className="mb-6">
          <SectionHeading>By topic</SectionHeading>
          <div className="space-y-1">
            {byTopic.map(([topic, n]) => (
              <div key={topic} className="flex items-center justify-between gap-2 px-2 py-1.5">
                <span className="text-sm text-foreground truncate">{topic}</span>
                <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">{n}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Average length */}
      {list.length > 0 && (
        <section>
          <div className="p-3 rounded-xl border border-border bg-card">
            <div className="flex items-start gap-2">
              <Clock size={13} weight="fill" className="text-foreground/40 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Average reel runs{' '}
                <span className="font-medium text-foreground">
                  {formatDuration(Math.round(totals.seconds / list.length))}
                </span>
                . Your best performer drew {formatNumber(maxViews)} views.
              </p>
            </div>
          </div>
        </section>
      )}
    </aside>
  )
}
