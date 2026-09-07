'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Bell, Cake, Users, Briefcase, ChatCircle, Target, Heart, At,
  CalendarBlank, Sparkle, Star,
} from '@phosphor-icons/react'
import { useUIStore } from '@/stores/uiStore'
import { useNotifications } from '@/queries'
import { useAppStore } from '@/stores/appStore'
import { CommunicationComposer } from '@/components/contacts/CommunicationComposer'
import type { Notification } from '@/types/common'

const TYPE_CONFIG: Record<Notification['type'], { icon: React.ElementType; color: string }> = {
  birthday:     { icon: Cake,          color: 'text-rose-400' },
  followup:     { icon: Bell,          color: 'text-amber-400' },
  follow:       { icon: Users,         color: 'text-blue-400' },
  project:      { icon: Briefcase,     color: 'text-violet-400' },
  comment:      { icon: ChatCircle,    color: 'text-green-400' },
  mission:      { icon: Target,        color: 'text-foreground/60' },
  reaction:     { icon: Heart,         color: 'text-pink-400' },
  mention:      { icon: At,            color: 'text-blue-400' },
  event:        { icon: CalendarBlank, color: 'text-sky-400' },
  ai_suggestion: { icon: Sparkle,      color: 'text-primary' },
  opportunity:  { icon: Star,          color: 'text-amber-500' },
}

/** Only notifications naming a specific person are worth a reply — everything
 *  else just navigates to whatever it's about. */
const REPLY_CONTEXT: Partial<Record<Notification['type'], 'birthday' | 'followup' | 'thankyou'>> = {
  birthday: 'birthday',
  followup: 'followup',
  comment: 'thankyou',
  mention: 'thankyou',
  reaction: 'thankyou',
}

function resolveHref(n: Notification): string | null {
  if (!n.targetId) return null
  switch (n.targetType) {
    case 'project': return `/leader/projects/${n.targetId}`
    case 'contact': return `/leader/contacts/${n.targetId}`
    case 'follower': return `/leader/followers/${n.targetId}`
    case 'event': return `/leader/events/${n.targetId}`
    case 'opportunity': return '/leader/opportunities'
    case 'initiative': return '/leader/mission'
    case 'post': return '/leader/home'
    default: return null
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function NotificationDrawer() {
  const { notificationsPanelOpen, setNotificationsPanelOpen } = useUIStore()
  const { activeTenantId } = useAppStore()
  const { data: notifications } = useNotifications(activeTenantId)
  const router = useRouter()

  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [replyTarget, setReplyTarget] = useState<Notification | null>(null)

  function handleSelect(n: Notification) {
    setReadIds(prev => new Set(prev).add(n.id))
    const context = REPLY_CONTEXT[n.type]
    if (n.actorName && context) {
      setReplyTarget(n)
      return
    }
    const href = resolveHref(n)
    if (href) {
      setNotificationsPanelOpen(false)
      router.push(href)
    }
  }

  return (
    <>
      <AnimatePresence>
        {notificationsPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setNotificationsPanelOpen(false)}
            />
            <motion.aside
              initial={{ x: 380 }}
              animate={{ x: 0 }}
              exit={{ x: 380 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 h-full w-[360px] max-w-full bg-background border-l border-border z-50 flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                <button
                  onClick={() => setNotificationsPanelOpen(false)}
                  className="p-1.5 rounded-full hover:bg-foreground/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {(notifications ?? []).map(n => {
                  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.mission
                  const Icon = cfg.icon
                  const isRead = n.read || readIds.has(n.id)
                  const clickable = Boolean(REPLY_CONTEXT[n.type] && n.actorName) || Boolean(resolveHref(n))
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleSelect(n)}
                      disabled={!clickable}
                      className={`w-full flex items-start gap-3.5 px-5 py-4 border-b border-border text-left transition-colors ${clickable ? 'hover:bg-muted/30 cursor-pointer' : 'cursor-default'} ${!isRead ? 'bg-foreground/[0.025]' : ''}`}
                    >
                      <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                        <Icon size={18} weight="fill" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${isRead ? 'font-normal text-foreground/70' : 'font-semibold text-foreground'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{n.body}</p>
                        <p className="text-[11px] text-foreground/30 mt-1.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-foreground shrink-0 mt-1.5" />
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CommunicationComposer
        open={Boolean(replyTarget)}
        onClose={() => setReplyTarget(null)}
        recipientName={replyTarget?.actorName ?? ''}
        context={replyTarget ? REPLY_CONTEXT[replyTarget.type] : undefined}
      />
    </>
  )
}
