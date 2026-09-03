'use client'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, MapPin, Clock, Buildings, CheckCircle, ArrowSquareOut,
  Star, Tag, ShareNetwork, Globe,
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useOpportunity } from '@/queries'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate, opportunityTypeLabel } from '@/lib/formatting'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  job: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  internship: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  education: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  scholarship: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
  funding: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  mentorship: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  partnership: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  training: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
}

const STATUS_COPY: Record<string, { label: string; className: string }> = {
  open: { label: 'Open for applications', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  upcoming: { label: 'Opening soon', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
}

export function OpportunityDetailClient() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: opp, isLoading } = useOpportunity(activeTenantId, id)

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (!opp) {
    return (
      <div className="px-4 py-16">
        <EmptyState
          icon={<Star size={44} />}
          title="Opportunity not found"
          description="It may have been removed or is not available for this leader."
        />
      </div>
    )
  }

  const status = STATUS_COPY[opp.status] ?? STATUS_COPY.closed

  /** Facts worth pulling out of the prose, rendered only when present. */
  const facts = [
    { icon: Buildings, label: 'Organisation', value: opp.organization },
    { icon: MapPin, label: 'Location', value: opp.isRemote ? 'Remote' : opp.location },
    { icon: Clock, label: 'Deadline', value: opp.deadline ? formatDate(opp.deadline) : undefined },
    { icon: Star, label: 'Amount', value: opp.amount },
  ].filter(f => Boolean(f.value))

  return (
    <div>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold truncate flex-1">{opportunityTypeLabel(opp.type)}</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-5">
        {/* Title block */}
        <section>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full', TYPE_COLORS[opp.type] ?? 'bg-muted text-muted-foreground')}>
              {opportunityTypeLabel(opp.type)}
            </span>
            <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full', status.className)}>
              <CheckCircle size={11} weight="fill" />
              {status.label}
            </span>
            {opp.isRemote && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                <Globe size={11} weight="fill" />
                Remote
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">{opp.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{opp.organization}</p>
        </section>

        {/* Key facts */}
        {facts.length > 0 && (
          <section className="grid grid-cols-2 gap-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border bg-muted/40 p-3">
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Icon size={11} weight="fill" />
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground break-words">{value}</p>
              </div>
            ))}
          </section>
        )}

        {/* Description */}
        <section className="rounded-2xl border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">About</h3>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{opp.description}</p>
        </section>

        {/* Eligibility */}
        {opp.eligibility && (
          <section className="rounded-2xl border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Eligibility</h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{opp.eligibility}</p>
          </section>
        )}

        {/* Tags */}
        {opp.tags.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {opp.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="flex flex-wrap items-center gap-2 pt-1">
          {opp.applicationUrl ? (
            <a
              href={opp.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <ArrowSquareOut size={16} weight="bold" />
              Apply now
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">
              No application link on file — share this with the candidate directly.
            </span>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold text-foreground hover:bg-muted transition-colors">
            <ShareNetwork size={16} />
            Share
          </button>
        </section>
      </div>
    </div>
  )
}
