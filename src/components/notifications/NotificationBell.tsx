'use client'
import { Bell } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useUIStore } from '@/stores/uiStore'
import { useNotifications } from '@/queries'
import { cn } from '@/lib/utils'

/** Desktop-only floating trigger for the notifications drawer — mobile
 *  keeps its existing entry point inside the bottom nav's "More" sheet. */
export function NotificationBell() {
  const { activeTenantId } = useAppStore()
  const { data: notifications } = useNotifications(activeTenantId)
  const { notificationsPanelOpen, setNotificationsPanelOpen } = useUIStore()
  const unread = notifications?.filter(n => !n.read).length ?? 0

  return (
    <button
      onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
      aria-label="Notifications"
      className="hidden md:flex fixed top-4 right-4 xl:right-6 z-40 w-11 h-11 rounded-full bg-card border border-border shadow-lg items-center justify-center hover:bg-muted transition-colors"
    >
      <Bell size={19} weight={unread > 0 ? 'fill' : 'regular'} className={cn(unread > 0 ? 'text-primary' : 'text-foreground/70')} />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}
