'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DotsThreeOutline, Bell, Gear, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { useUIStore } from '@/stores/uiStore'
import { useNotifications, useLeader } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { NAV_ITEMS, MOBILE_PRIMARY_HREFS, type NavItem } from './navItems'

// Same 4 destinations as before, but ordered to match the desktop sidebar
// (NAV_ITEMS) instead of a separately-curated sequence — filtering NAV_ITEMS
// down to the primary set, rather than mapping the primary hrefs to items,
// is what keeps the two orders in sync automatically.
const PRIMARY: NavItem[] = NAV_ITEMS.filter(i => MOBILE_PRIMARY_HREFS.includes(i.href))
/** Everything else — shown in the "More" sheet, so it isn't duplicated there. */
const MORE_ITEMS: NavItem[] = NAV_ITEMS.filter(i => !MOBILE_PRIMARY_HREFS.includes(i.href))

export function LeaderBottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const { activeTenantId } = useAppStore()
  const { data: notifications } = useNotifications(activeTenantId)
  const { data: leader } = useLeader(activeTenantId)
  const { setNotificationsPanelOpen } = useUIStore()
  const unread = notifications?.filter(n => !n.read).length ?? 0

  // Don't leave the page scrollable behind the open sheet.
  useEffect(() => {
    if (!moreOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [moreOpen])

  const isPrimaryActive = PRIMARY.some(i => pathname.startsWith(i.href))

  const tabClass = 'relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 group'

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t safe-bottom"
        style={{ height: 'calc(68px + env(safe-area-inset-bottom))' }}
        aria-label="Bottom navigation"
      >
        <div className="flex items-center h-[68px] max-w-lg mx-auto">
          {PRIMARY.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={tabClass}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon
                  size={22}
                  weight={isActive ? 'fill' : 'regular'}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span className={cn('text-[10px] font-medium transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')}>
                  {label}
                </span>
              </Link>
            )
          })}

          {/* 5th slot: everything that doesn't fit */}
          <button
            onClick={() => setMoreOpen(true)}
            className={tabClass}
            aria-label="More"
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
          >
            {!isPrimaryActive && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">
              <DotsThreeOutline
                size={22}
                weight={!isPrimaryActive ? 'fill' : 'regular'}
                className={cn('transition-colors', !isPrimaryActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}
              />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-foreground text-background text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
            <span className={cn('text-[10px] font-medium transition-colors', !isPrimaryActive ? 'text-primary' : 'text-muted-foreground')}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* All-destinations sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              key="more-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] md:hidden"
            />
            <motion.div
              key="more-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="All destinations"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-[70] md:hidden bg-card rounded-t-3xl border-t shadow-2xl max-h-[85dvh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b shrink-0">
                {leader ? (
                  <Link href="/leader/profile" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 min-w-0">
                    <Avatar src={leader.avatarUrl} name={leader.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold truncate">{leader.name}</span>
                      <span className="block text-[11px] text-foreground/50 truncate">
                        @{leader.tenantId?.replace('tenant-', '')}
                      </span>
                    </span>
                  </Link>
                ) : <span className="text-sm font-bold">Menu</span>}
                <button
                  onClick={() => setMoreOpen(false)}
                  aria-label="Close menu"
                  className="p-2 -mr-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto px-3 py-3" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                <div className="grid grid-cols-3 gap-1">
                  {MORE_ITEMS.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname.startsWith(href)
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-colors',
                          isActive ? 'bg-muted text-primary font-semibold' : 'text-foreground hover:bg-muted/60'
                        )}
                      >
                        <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                        <span className="text-xs font-medium text-center leading-tight">{label}</span>
                      </Link>
                    )
                  })}
                </div>

                <div className="border-t mt-3 pt-3 space-y-0.5">
                  <button
                    onClick={() => { setMoreOpen(false); setNotificationsPanelOpen(true) }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Bell size={22} />
                    <span className="text-[15px] flex-1 text-left">Notifications</span>
                    {unread > 0 && (
                      <span className="bg-foreground text-background text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  <Link
                    href="/leader/settings"
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                      pathname.startsWith('/leader/settings') ? 'bg-muted text-primary font-semibold' : 'text-foreground hover:bg-muted/60'
                    )}
                  >
                    <Gear size={22} weight={pathname.startsWith('/leader/settings') ? 'fill' : 'regular'} />
                    <span className="text-[15px]">Settings</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
