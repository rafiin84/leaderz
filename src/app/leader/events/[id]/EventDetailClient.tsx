'use client'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Users, CalendarBlank, Plus, Share, Check } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useEvent } from '@/queries'
import { Skeleton } from '@/components/common/Skeleton'
import { formatDate, formatNumber } from '@/lib/formatting'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function EventDetailClient() {
  const params = useParams()
  const router = useRouter()
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const eventId = params.id as string
  const { data: event, isLoading } = useEvent(activeTenantId, eventId)

  if (isLoading) {
    return <div className="max-w-2xl mx-auto p-4 space-y-4"><Skeleton className="h-52 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
  }

  if (!event) {
    return <div className="max-w-2xl mx-auto p-4 text-center py-16"><p className="text-muted-foreground">Event not found</p></div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"><ArrowLeft size={20} /></button>
          <h1 className="text-base font-semibold flex-1 truncate">{event.title}</h1>
          <button className="p-2 rounded-xl hover:bg-muted transition-colors"><Share size={18} /></button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-5">
        {/* Hero */}
        {event.coverImageUrl && (
          <div className="relative h-52 rounded-2xl overflow-hidden">
            <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-2xl font-bold text-white">{event.title}</h2>
              <div className="flex items-center gap-3 text-white/80 text-xs mt-1">
                <span className="flex items-center gap-1"><MapPin size={11} weight="fill" />{event.stateName}</span>
                <span className="flex items-center gap-1"><Users size={11} />{formatNumber(event.participantCount)} participants</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          {['Join', 'Post update', 'Add Reel'].map(action => (
            <button key={action} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
              <Plus size={14} />
              {action}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="rounded-2xl border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">About this event</h3>
          <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarBlank size={12} />{event.isOngoing ? 'Ongoing' : formatDate(event.date)}</span>
            <span className="flex items-center gap-1"><MapPin size={12} />{event.geographicScope.level === 'state' ? event.stateName : 'India'}</span>
          </div>
        </div>

        {/* Local activities */}
        {event.localActivities.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Local activities ({event.localActivities.length})
              </h3>
              {event.allowFollowerActivities && (
                <button className="text-xs text-primary font-medium flex items-center gap-1"><Plus size={12} />Create</button>
              )}
            </div>
            <div className="space-y-3">
              {event.localActivities.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold">{activity.title}</h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {activity.createdByFollower && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">Follower</span>
                      )}
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize',
                        activity.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                        activity.status === 'approved' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><MapPin size={11} />{activity.districtName}, {activity.stateName}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{formatNumber(activity.participantCount)}</span>
                  </div>
                  {activity.description && <p className="text-xs text-muted-foreground">{activity.description}</p>}
                  {activity.mediaUrls.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {activity.mediaUrls.map((url, j) => (
                        <img key={j} src={url} alt="" className="h-20 w-28 rounded-xl object-cover shrink-0" loading="lazy" />
                      ))}
                    </div>
                  )}
                  {activity.createdByFollower && activity.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                        <Check size={13} />Approve
                      </button>
                      <button className="px-3 py-2 rounded-xl bg-muted text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors">Decline</button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
