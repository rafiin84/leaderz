'use client'
import Link from 'next/link'

/** Shared shell so every route panel lines up with the others. */
export function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-0 h-screen py-6 pl-6 pr-3 overflow-y-auto scrollbar-none">
      {children}
    </aside>
  )
}

export function PanelHeading({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">{children}</h3>
      {href && <Link href={href} className="text-xs text-primary font-medium">See all</Link>}
    </div>
  )
}

/** The big number at the top of a panel. */
export function PanelHeadline({
  value,
  label,
  detail,
}: {
  value: React.ReactNode
  label: string
  detail?: React.ReactNode
}) {
  return (
    <section className="mb-6">
      <p className="text-4xl font-black tracking-tight text-foreground leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{label}</p>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </section>
  )
}

/** Small bordered figure, used in 2-up grids. */
export function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="p-2.5 rounded-xl border border-border bg-card">
      <dt className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {Icon && <Icon size={10} weight="fill" />}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-bold text-foreground tabular-nums truncate">{value}</dd>
    </div>
  )
}

/** Labelled count with a proportional bar — for breakdowns by state or type. */
export function BreakdownRow({
  label,
  count,
  max,
}: {
  label: string
  count: number
  max: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm text-foreground truncate capitalize">{label}</span>
        <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">{count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-foreground/70"
          style={{ width: `${Math.round((count / Math.max(max, 1)) * 100)}%` }}
        />
      </div>
    </div>
  )
}

/** Counts occurrences of a key, sorted descending. */
export function tally<T>(items: T[], key: (item: T) => string | undefined): [string, number][] {
  const counts = new Map<string, number>()
  for (const i of items) {
    const k = key(i)
    if (!k) continue
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}
