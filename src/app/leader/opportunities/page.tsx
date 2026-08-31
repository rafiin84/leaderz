'use client'
import { useState } from 'react'
import { Star, Plus } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useOpportunities } from '@/queries'
import { OpportunityCard } from '@/components/opportunities/OpportunityCard'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { opportunityTypeLabel } from '@/lib/formatting'

const TYPES = ['job', 'internship', 'scholarship', 'funding', 'mentorship', 'education', 'partnership', 'training']

export default function OpportunitiesPage() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: opportunities, isLoading } = useOpportunities(activeTenantId)
  const [filter, setFilter] = useState<string | null>(null)

  const filtered = filter ? opportunities?.filter(o => o.type === filter) : opportunities

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Star size={20} className="text-primary" weight="fill" />
          <h1 className="text-xl font-bold flex-1">Opportunities</h1>
          <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} weight="bold" />
            Create
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          <button onClick={() => setFilter(null)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${!filter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>All</button>
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilter(filter === t ? null : t)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filter === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {opportunityTypeLabel(t)}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">{[1,2,3].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
        ) : !filtered?.length ? (
          <EmptyState icon={<Star size={48} />} title="No opportunities yet" description="Create opportunities for your followers and community." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />)}
          </div>
        )}
      </div>
    </div>
  )
}
