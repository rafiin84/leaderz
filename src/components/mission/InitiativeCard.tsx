'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Users, MapPin } from '@phosphor-icons/react'
import type { Initiative } from '@/types/mission'
import { formatNumber } from '@/lib/formatting'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const statusColors = {
  planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  completed: 'bg-muted text-muted-foreground',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
}

interface Props {
  initiative: Initiative
  index?: number
}

export function InitiativeCard({ initiative, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/leader/events?initiative=${initiative.id}`} className="block rounded-2xl border bg-card overflow-hidden card-hover hover:shadow-md transition-all">
        {initiative.coverImageUrl && (
          <div className="h-32 overflow-hidden">
            <img src={initiative.coverImageUrl} alt={initiative.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-foreground">{initiative.title}</h3>
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0', statusColors[initiative.status])}>
              {initiative.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{initiative.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {formatNumber(initiative.participantCount)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {initiative.districtCount} districts
            </span>
            <ArrowRight size={12} className="ml-auto" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
