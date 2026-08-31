'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Cake, Users, Briefcase, ChatCircle, Target } from '@phosphor-icons/react'
import { useUIStore } from '@/stores/uiStore'
import { useNotifications } from '@/queries'
import { useAppStore } from '@/stores/appStore'

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  birthday: { icon: Cake,        color: 'text-rose-400' },
  followup: { icon: Bell,        color: 'text-amber-400' },
  follow:   { icon: Users,       color: 'text-blue-400' },
  project:  { icon: Briefcase,   color: 'text-violet-400' },
  comment:  { icon: ChatCircle,  color: 'text-green-400' },
  mission:  { icon: Target,      color: 'text-foreground/60' },
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

  return (
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
            initial={{ x: -380 }}
            animate={{ x: 0 }}
            exit={{ x: -380 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 h-full w-[360px] bg-background border-r border-border z-50 flex flex-col shadow-xl"
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
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3.5 px-5 py-4 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-default ${!n.read ? 'bg-foreground/[0.025]' : ''}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                      <Icon size={18} weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${n.read ? 'font-normal text-foreground/70' : 'font-semibold text-foreground'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{n.body}</p>
                      <p className="text-[11px] text-foreground/30 mt-1.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-foreground shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
