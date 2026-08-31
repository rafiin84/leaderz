'use client'
import { motion } from 'framer-motion'
import { CalendarBlank, MapPin, Users, Plus, ArrowRight } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useEvents } from '@/queries'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate, formatNumber } from '@/lib/formatting'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  completed: 'bg-muted text-muted-foreground',
}

export default function EventsPage() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: events, isLoading } = useEvents(activeTenantId)

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <CalendarBlank size={20} className="text-primary" weight="fill" />
          <h1 className="text-xl font-bold flex-1">Events</h1>
          <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} weight="bold" />
            Create
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
        ) : !events?.length ? (
          <EmptyState
            icon={<CalendarBlank size={48} />}
            title="No active events yet"
            description="Create an event to bring people together around your Mission."
          />
        ) : (
          <div className="space-y-6">
            {events.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link href={`/leader/events/${event.id}`} className="block rounded-2xl border bg-card overflow-hidden card-hover hover:shadow-md transition-all">
                  {event.coverImageUrl && (
                    <div className="relative h-44 overflow-hidden">
                      <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full capitalize', statusColors[event.status])}>
                          {event.status}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h2 className="text-lg font-bold text-white">{event.title}</h2>
                        <div className="flex items-center gap-3 text-white/80 text-xs mt-1">
                          <span className="flex items-center gap-1"><MapPin size={11} />{event.stateName}</span>
                          <span className="flex items-center gap-1"><Users size={11} />{formatNumber(event.participantCount)}</span>
                          <span className="flex items-center gap-1"><CalendarBlank size={11} />{event.isOngoing ? 'Ongoing' : formatDate(event.date)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>

                    {event.localActivities.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Local activities ({event.localActivities.length})</p>
                        {event.localActivities.slice(0, 3).map(activity => (
                          <div key={activity.id} className="flex items-start gap-2 p-2 rounded-xl bg-muted">
                            <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', activity.status === 'completed' ? 'bg-emerald-500' : activity.status === 'approved' ? 'bg-blue-500' : 'bg-muted-foreground')} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{activity.title}</p>
                              <p className="text-[10px] text-muted-foreground">{activity.districtName} · {formatNumber(activity.participantCount)} participants</p>
                            </div>
                            {activity.createdByFollower && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">Follower</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end mt-3">
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">View event <ArrowRight size={12} /></span>
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
