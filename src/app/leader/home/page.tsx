'use client'
import { motion } from 'framer-motion'
import { Bell, MagnifyingGlass } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { usePosts } from '@/queries'
import { useAISuggestions } from '@/queries'
import { useOpportunities, useProjects } from '@/queries'
import { AttentionStrip } from '@/components/home/AttentionStrip'
import { MissionPulse } from '@/components/home/MissionPulse'
import { PostCard } from '@/components/content/PostCard'
import { AISuggestionCard } from '@/components/ai/AISuggestionCard'
import { OpportunityCard } from '@/components/opportunities/OpportunityCard'
import { CardSkeleton } from '@/components/common/Skeleton'
import Link from 'next/link'

export default function HomePage() {
  const { activeTenantId } = useAppStore()
  const { data: posts, isLoading: postsLoading } = usePosts(activeTenantId)
  const { data: suggestions } = useAISuggestions(activeTenantId)
  const { data: opportunities } = useOpportunities(activeTenantId)
  const { data: projects } = useProjects(activeTenantId)

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Home</h1>
          <div className="flex items-center gap-0.5">
            <Link href="/leader/contacts" className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Search">
              <MagnifyingGlass size={20} />
            </Link>
            <Link href="/leader/notifications" className="relative p-2 rounded-full hover:bg-muted transition-colors" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-foreground rounded-full" />
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Attention strip */}
        <AttentionStrip />

        {/* AI Briefing */}
        {suggestions && suggestions.filter(s => s.type === 'briefing' && !s.dismissed).length > 0 && (
          <section>
            {suggestions.filter(s => s.type === 'briefing' && !s.dismissed).slice(0, 1).map(s => (
              <AISuggestionCard key={s.id} suggestion={s} />
            ))}
          </section>
        )}

        {/* Mission Pulse */}
        <MissionPulse />

        {/* AI Relationship Suggestions */}
        {suggestions && suggestions.filter(s => s.type === 'relationship' && !s.dismissed).length > 0 && (
          <section aria-label="AI relationship insights">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Relationship insights</h2>
            <div className="space-y-3">
              {suggestions.filter(s => s.type === 'relationship' && !s.dismissed).slice(0, 2).map(s => (
                <AISuggestionCard key={s.id} suggestion={s} />
              ))}
            </div>
          </section>
        )}

        {/* Project Discovery */}
        {projects && projects.length > 0 && (
          <section aria-label="Project discoveries">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Discovered</h2>
              <Link href="/leader/projects" className="text-xs text-primary font-medium">See all</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory">
              {projects.slice(0, 3).map(project => (
                <Link
                  key={project.id}
                  href={`/leader/projects/${project.id}`}
                  className="snap-start shrink-0 w-64 rounded-2xl border bg-card overflow-hidden card-hover hover:shadow-md transition-all"
                >
                  <div className="h-32 overflow-hidden">
                    <img src={project.heroImageUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{project.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.location}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Content Feed */}
        <section aria-label="Content feed">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Latest</h2>
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {posts?.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </section>

        {/* Opportunities */}
        {opportunities && opportunities.length > 0 && (
          <section aria-label="Opportunities">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Opportunities</h2>
              <Link href="/leader/opportunities" className="text-xs text-primary font-medium">See all</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory">
              {opportunities.slice(0, 3).map(opp => (
                <div key={opp.id} className="snap-start shrink-0 w-72">
                  <OpportunityCard opportunity={opp} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
