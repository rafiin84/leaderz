'use client'
import { motion } from 'framer-motion'
import { PencilSimple, Target, Users, FilmStrip, FileText, Gear, Sun, Moon, Desktop, ArrowRight, Shield, UsersThree, ChartBar } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useLeader, useMission, useTeam } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { TenantSwitcher } from '@/components/common/TenantSwitcher'
import { Skeleton } from '@/components/common/Skeleton'
import { formatNumber } from '@/lib/formatting'
import { MOCK_TENANTS } from '@/data/mock/leaders'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { activeTenantId, theme, setTheme, userRole } = useAppStore()
  const { data: leader, isLoading } = useLeader(activeTenantId)
  const { data: mission } = useMission(activeTenantId)
  const { data: team } = useTeam(activeTenantId)
  const activeTenant = MOCK_TENANTS.find(t => t.id === activeTenantId)

  return (
    <div className="max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <h1 className="text-xl font-bold flex-1">Profile</h1>
          <TenantSwitcher compact />
          <button className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="Edit profile">
            <PencilSimple size={18} />
          </button>
        </div>
      </header>

      {/* Cover image */}
      <div className="relative h-36 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        {leader?.coverImageUrl && (
          <img src={leader.coverImageUrl} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/40" />
      </div>

      <div className="px-4 pb-4">
        {/* Profile card */}
        <div className="-mt-8 mb-5">
          <div className="flex items-end justify-between mb-3">
            <Avatar
              src={leader?.avatarUrl ?? activeTenant?.avatarUrl}
              name={leader?.name ?? activeTenant?.leaderName ?? ''}
              size="2xl"
              verified
              className="ring-4 ring-background"
            />
            {isLoading ? null : (
              <div className="flex gap-2">
                <Link href="/leader/contacts" className="px-4 py-2 rounded-xl bg-muted text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors">Contacts</Link>
                <Link href="/leader/mission" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Mission</Link>
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-36" /></div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground">{leader?.name}</h2>
              <p className="text-sm text-muted-foreground">{leader?.title} · {leader?.organization}</p>
              {leader?.location && <p className="text-xs text-muted-foreground mt-0.5">{leader.location}</p>}
            </>
          )}
        </div>

        {/* Bio */}
        {leader?.bio && (
          <div className="mb-5">
            <p className="text-sm text-foreground leading-relaxed">{leader.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Followers', value: formatNumber(activeTenant?.followerCount ?? 0) },
            { label: 'Posts', value: leader?.postCount ?? 0 },
            { label: 'Reels', value: leader?.reelCount ?? 0 },
          ].map(stat => (
            <div key={stat.label} className="text-center rounded-2xl bg-muted p-3">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation section */}
        <nav className="space-y-2" aria-label="Profile navigation">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">Manage</p>

          {[
            { href: '/leader/mission', icon: Target, label: 'Mission', description: mission?.title },
            { href: '/leader/events', icon: FilmStrip, label: 'Events & Initiatives', description: 'Manage your events' },
            { href: '/leader/projects', icon: FileText, label: 'Projects & Talent', description: 'Discovered projects' },
            { href: '/leader/followers', icon: Users, label: 'Followers', description: `${formatNumber(activeTenant?.followerCount ?? 0)} following you` },
            { href: '/leader/team', icon: UsersThree, label: 'Team', description: `${team?.length ?? 0} members` },
            { href: '/leader/opportunities', icon: Target, label: 'Opportunities', description: 'Jobs, funding, mentorship' },
          ].map(({ href, icon: Icon, label, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </Link>
          ))}
        </nav>

        {/* Theme */}
        <div className="mt-5 rounded-2xl border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Appearance</p>
          <div className="flex gap-2">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Desktop, label: 'System' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
                className={cn('flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm transition-all', theme === value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted')}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View as role */}
        <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Demo: Use the tenant switcher (top left on desktop, profile header on mobile) to switch leaders or view as a different role.
          </p>
        </div>
      </div>
    </div>
  )
}
