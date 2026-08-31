'use client'
import { motion } from 'framer-motion'
import { Briefcase, MapPin, Users, ArrowRight } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useProjects } from '@/queries'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { formatNumber } from '@/lib/formatting'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  seeking_support: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  funded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completed: 'bg-muted text-muted-foreground',
}

const statusLabels = {
  active: 'Active',
  seeking_support: 'Seeking Support',
  funded: 'Funded',
  completed: 'Completed',
}

export default function ProjectsPage() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: projects, isLoading } = useProjects(activeTenantId)

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Briefcase size={20} className="text-primary" weight="fill" />
          <h1 className="text-xl font-bold flex-1">Projects & Talent</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
        ) : !projects?.length ? (
          <EmptyState
            icon={<Briefcase size={48} />}
            title="Discover people building something meaningful"
            description="Projects from your Mission activities will appear here."
          />
        ) : (
          <div className="space-y-4">
            {projects.map((project, i) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link href={`/leader/projects/${project.id}`} className="block rounded-2xl border bg-card overflow-hidden card-hover hover:shadow-md transition-all">
                  <div className="relative h-44 overflow-hidden">
                    <img src={project.heroImageUrl} alt={project.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', statusColors[project.status])}>
                        {statusLabels[project.status]}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="text-lg font-bold text-white">{project.title}</h2>
                      {project.tagline && <p className="text-white/80 text-xs mt-0.5">{project.tagline}</p>}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description.slice(0, 120)}…</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin size={11} />{project.location}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{project.team.length} team</span>
                      <span className="ml-auto flex items-center gap-1 text-primary font-medium">View <ArrowRight size={12} /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
