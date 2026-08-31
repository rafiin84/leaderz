'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Bell, ArrowLeft, Cake, Lightning, UsersThree, Briefcase,
  Target, ChatCircle, Heart, At, CalendarBlank, Sparkle,
  Star, Checks
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useNotifications } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { formatRelativeTime } from '@/lib/formatting'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/common'

const TYPE_CONFIG: Record<Notification['type'], { icon: React.ElementType; color: string; bg: string }> = {
  birthday:     { icon: Cake,         color: 'text-rose-600',   bg: 'bg-rose-100 dark:bg-rose-900/40' },
  followup:     { icon: Lightning,    color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/40' },
  follow:       { icon: UsersThree,   color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/40' },
  project:      { icon: Briefcase,    color: 'text-emerald-600',bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  mission:      { icon: Target,       color: 'text-primary',    bg: 'bg-primary/10' },
  comment:      { icon: ChatCircle,   color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/40' },
  reaction:     { icon: Heart,        color: 'text-pink-500',   bg: 'bg-pink-100 dark:bg-pink-900/40' },
  mention:      { icon: At,           color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/40' },
  event:        { icon: CalendarBlank,color: 'text-rose-600',   bg: 'bg-rose-100 dark:bg-rose-900/40' },
  ai_suggestion:{ icon: Sparkle,      color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  opportunity:  { icon: Star,         color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/40' },
}

export default function NotificationsPage() {
  const router = useRouter()
  const { activeTenantId } = useAppStore()
  const { data: notifications = [], isLoading } = useNotifications(activeTenantId)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  function isRead(n: Notification) {
    return n.read || readIds.has(n.id)
  }

  function markAllRead() {
    setReadIds(new Set(notifications.map(n => n.id)))
  }

  function markRead(id: string) {
    setReadIds(prev => new Set([...prev, id]))
  }

  const displayed = filter === 'unread'
    ? notifications.filter(n => !isRead(n))
    : notifications

  const unreadCount = notifications.filter(n => !isRead(n)).length

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex-1">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-colors"
            >
              <Checks size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-4 pb-3">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
                filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>
      </header>

      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="px-4 py-8 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bell size={28} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              {filter === 'unread' ? 'All caught up!' : 'No notifications'}
            </p>
            <p className="text-sm text-muted-foreground">
              {filter === 'unread' ? 'No unread notifications right now.' : "You'll see activity here."}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayed.map((notif, i) => (
              <NotificationRow
                key={notif.id}
                notif={notif}
                read={isRead(notif)}
                onRead={() => markRead(notif.id)}
                index={i}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function NotificationRow({
  notif, read, onRead, index,
}: {
  notif: Notification
  read: boolean
  onRead: () => void
  index: number
}) {
  const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.mission
  const Icon = config.icon

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onRead}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-4 text-left transition-colors',
        read ? 'bg-background hover:bg-muted/40' : 'bg-primary/[0.03] hover:bg-primary/[0.06]'
      )}
    >
      {/* Icon or avatar */}
      <div className="relative shrink-0">
        {notif.actorAvatar ? (
          <Avatar src={notif.actorAvatar} name={notif.actorName ?? ''} size="md" />
        ) : (
          <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', config.bg)}>
            <Icon size={18} className={config.color} weight="fill" />
          </div>
        )}
        {notif.actorAvatar && (
          <span className={cn('absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-background', config.bg)}>
            <Icon size={11} className={config.color} weight="fill" />
          </span>
        )}
        {!read && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={cn('text-sm leading-snug', read ? 'text-foreground' : 'text-foreground font-medium')}>
          {notif.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {notif.body}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1.5">
          {formatRelativeTime(notif.createdAt)}
        </p>
      </div>

      {!read && (
        <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
      )}
    </motion.button>
  )
}
