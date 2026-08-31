'use client'
import { motion } from 'framer-motion'
import { Target, ArrowRight, TrendUp } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useMission } from '@/queries'
import { formatNumber } from '@/lib/formatting'
import Link from 'next/link'

export function MissionPulse() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: mission } = useMission(activeTenantId)

  if (!mission) return null

  const stats = [
    { label: 'Followers', value: formatNumber(mission.impact.peopleReached) },
    { label: 'Districts', value: mission.impact.districtsActive },
    { label: 'Activities', value: mission.impact.activitiesCount },
    { label: 'Projects', value: mission.impact.projectsDiscovered },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      aria-label="Mission pulse"
    >
      <Link href="/leader/mission" className="block rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-all card-hover">
        <div className="relative h-24 overflow-hidden">
          {mission.coverImageUrl && (
            <img src={mission.coverImageUrl} alt={mission.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute inset-0 p-4 flex items-center gap-3">
            <Target size={20} className="text-white shrink-0" weight="fill" />
            <div>
              <p className="text-xs font-medium text-white/70">Your Mission</p>
              <p className="text-base font-bold text-white">{mission.title}</p>
            </div>
            <ArrowRight size={16} className="text-white ml-auto" />
          </div>
        </div>

        <div className="p-3">
          <div className="flex flex-wrap gap-1 mb-3">
            {mission.topics.slice(0, 4).map(topic => (
              <span
                key={topic.id}
                className="shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium bg-muted text-foreground/70"
              >
                {topic.name}
              </span>
            ))}
            {mission.topics.length > 4 && (
              <span className="shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                +{mission.topics.length - 4} more
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-base font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </motion.section>
  )
}
