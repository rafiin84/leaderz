'use client'
import { CalendarBlank, MapPin, ArrowUpRight } from '@phosphor-icons/react'
import type { Opportunity } from '@/types/mission'
import { formatShortDate, opportunityTypeLabel } from '@/lib/formatting'
import { cn } from '@/lib/utils'

const typeColors: Record<string, string> = {
  job: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  internship: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  education: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  scholarship: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  funding: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  mentorship: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  partnership: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  training: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
}

interface Props {
  opportunity: Opportunity
}

export function OpportunityCard({ opportunity: opp }: Props) {
  return (
    <div className="rounded-2xl border bg-card p-4 card-hover hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={cn('text-[10px] font-semibold px-2.5 py-0.5 rounded-full', typeColors[opp.type])}>
          {opportunityTypeLabel(opp.type)}
        </span>
        <button className="p-1 rounded-lg hover:bg-muted transition-colors" aria-label="Open opportunity">
          <ArrowUpRight size={14} className="text-muted-foreground" />
        </button>
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-0.5">{opp.title}</h3>
      <p className="text-xs font-medium text-muted-foreground mb-2">{opp.organization}</p>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{opp.description}</p>

      {opp.eligibility && (
        <p className="text-xs text-foreground bg-muted rounded-lg px-3 py-2 mb-3 line-clamp-2">
          <span className="font-medium">Eligibility: </span>{opp.eligibility}
        </p>
      )}

      {opp.amount && (
        <p className="text-sm font-bold text-primary mb-2">{opp.amount}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {opp.location && (
          <span className="flex items-center gap-1 truncate">
            <MapPin size={11} />
            {opp.location}
          </span>
        )}
        {opp.deadline && (
          <span className="flex items-center gap-1 ml-auto shrink-0">
            <CalendarBlank size={11} />
            {formatShortDate(opp.deadline)}
          </span>
        )}
      </div>
    </div>
  )
}
