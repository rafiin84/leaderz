'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  House, FilmStrip, AddressBook, User, Target, CalendarBlank,
  Briefcase, Star, Bell, Gear, Users, PencilSimple, CaretLeft, CaretRight
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/queries'
import { useAppStore } from '@/stores/appStore'
import { useLeader } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { useUIStore } from '@/stores/uiStore'

const NAV_ITEMS: { href: string; icon: React.ElementType; label: string }[] = [
  { href: '/leader/home', icon: House, label: 'Home' },
  { href: '/leader/followers', icon: Users, label: 'Followers' },
  { href: '/leader/contacts', icon: AddressBook, label: 'Contacts' },
  { href: '/leader/reels', icon: FilmStrip, label: 'Reels' },
  { href: '/leader/mission', icon: Target, label: 'Mission' },
  { href: '/leader/events', icon: CalendarBlank, label: 'Events' },
  { href: '/leader/projects', icon: Briefcase, label: 'Projects' },
  { href: '/leader/opportunities', icon: Star, label: 'Opportunities' },
  { href: '/leader/profile', icon: User, label: 'Profile' },
]

export function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { activeTenantId } = useAppStore()
  const { data: notifications } = useNotifications(activeTenantId)
  const { data: leader } = useLeader(activeTenantId)
  const { setPostComposerOpen, setNotificationsPanelOpen } = useUIStore()
  const unread = notifications?.filter(n => !n.read).length ?? 0

  const itemClass = (active: boolean) => cn(
    'flex items-center rounded-full transition-colors duration-150',
    collapsed ? 'justify-center px-0 py-2.5 w-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full',
    active
      ? 'font-bold text-foreground'
      : 'font-normal text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
  )

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 shrink-0 py-3 z-30 transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-[72px] pr-0 items-center' : 'w-56 pr-3'
      )}
    >
      {/* Logo + collapse toggle */}
      <div className={cn('flex items-center mb-1', collapsed ? 'justify-center px-0 py-2 w-full' : 'justify-between px-3 py-2')}>
        {!collapsed && (
          <span className="text-xl font-black tracking-tight text-foreground">LeaderZ</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'p-1.5 rounded-full text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <CaretRight size={15} weight="bold" /> : <CaretLeft size={15} weight="bold" />}
        </button>
      </div>

      {/* Notifications bell */}
      <button
        onClick={() => setNotificationsPanelOpen(true)}
        title="Notifications"
        className={cn(
          'relative flex items-center rounded-full text-[15px] font-normal text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors',
          collapsed ? 'justify-center p-2.5 w-10 mx-auto mb-0.5' : 'gap-3 px-3 py-2.5 w-full mb-0'
        )}
      >
        <span className="relative shrink-0">
          <Bell size={22} weight="regular" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-foreground text-background text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </span>
        {!collapsed && <span>Notifications</span>}
      </button>

      {/* Nav items */}
      <nav className={cn('flex-1 space-y-0.5', collapsed ? 'w-full flex flex-col items-center' : '')} aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined} className={itemClass(isActive)}>
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              {!collapsed && <span className="text-[15px]">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Post button */}
      <button
        onClick={() => setPostComposerOpen(true)}
        title="Post"
        className={cn(
          'flex items-center justify-center gap-2 rounded-full bg-foreground text-background font-bold hover:bg-foreground/85 transition-colors mt-2 mb-3',
          collapsed ? 'w-10 h-10 mx-auto p-0' : 'mx-3 py-3 text-sm'
        )}
      >
        <PencilSimple size={16} weight="bold" />
        {!collapsed && 'Post'}
      </button>

      {/* Settings + Profile */}
      <div className={cn('border-t border-border/50 pt-3 space-y-0.5', collapsed ? 'w-full flex flex-col items-center' : '')}>
        <Link
          href="/leader/settings"
          title={collapsed ? 'Settings' : undefined}
          className={itemClass(pathname.startsWith('/leader/settings'))}
        >
          <Gear size={22} weight={pathname.startsWith('/leader/settings') ? 'fill' : 'regular'} />
          {!collapsed && <span className="text-[15px]">Settings</span>}
        </Link>

        {leader && (
          <Link
            href="/leader/profile"
            title={collapsed ? leader.name : undefined}
            className={cn(
              'flex items-center rounded-full hover:bg-foreground/5 transition-colors',
              collapsed ? 'justify-center p-1.5 w-10 mx-auto' : 'gap-2.5 px-3 py-2.5'
            )}
          >
            <Avatar src={leader.avatarUrl} name={leader.name} size="sm" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{leader.name.split(' ')[0]}</p>
                <p className="text-[11px] text-foreground/50 truncate">@{leader.tenantId?.replace('tenant-', '')}</p>
              </div>
            )}
          </Link>
        )}
      </div>
    </aside>
  )
}
