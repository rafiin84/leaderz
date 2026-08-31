'use client'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, MagnifyingGlass, Phone, MapPin } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useFollowers } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { MOCK_TENANTS } from '@/data/mock/leaders'
import Link from 'next/link'

function formatCount(n: number): string {
  if (n >= 10_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function getState(location?: string): string | null {
  if (!location) return null
  const parts = location.split(',').map(s => s.trim())
  return parts[parts.length - 1] || null
}

const STATE_COORDS: Record<string, { x: number; y: number }> = {
  'Tamil Nadu':       { x: 185, y: 295 },
  'Karnataka':        { x: 145, y: 252 },
  'Kerala':           { x: 132, y: 308 },
  'Andhra Pradesh':   { x: 190, y: 238 },
  'Telangana':        { x: 172, y: 215 },
  'Maharashtra':      { x: 118, y: 192 },
  'Gujarat':          { x: 82, y: 155 },
  'Rajasthan':        { x: 118, y: 118 },
  'Uttar Pradesh':    { x: 178, y: 130 },
  'Delhi':            { x: 155, y: 100 },
  'West Bengal':      { x: 228, y: 175 },
  'Bihar':            { x: 205, y: 148 },
  'Odisha':           { x: 215, y: 195 },
  'Madhya Pradesh':   { x: 152, y: 168 },
}

const MOCK_PHONES: Record<string, string> = {
  'f-07': '+919840512345',
  'f-05': '+917654321098',
  'f-08': '+914450067890',
  'f-01': '+919840011234',
  'f-04': '+914428578455',
}

function IndiaMap({ stateCounts }: { stateCounts: Record<string, number> }) {
  const max = Math.max(...Object.values(stateCounts), 1)
  const markers = Object.entries(stateCounts)
    .map(([state, count]) => ({ state, count, ...(STATE_COORDS[state] ?? null) }))
    .filter(d => d.x !== undefined)

  return (
    <div className="rounded-xl border p-3">
      <p className="text-xs font-semibold text-foreground/60 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
        <MapPin size={11} weight="fill" />
        Follower origins
      </p>
      <div className="flex gap-4 items-start">
        <svg viewBox="0 0 300 380" className="w-36 shrink-0">
          {/* Main India outline */}
          <path
            d="M 148,22 C 160,16 175,15 188,20 C 205,26 218,38 228,52 C 240,68 250,88 255,112
               C 258,130 252,148 245,165 C 240,182 238,200 240,218 C 242,235 238,252 230,268
               C 220,282 208,294 195,308 C 182,320 170,332 160,338
               C 150,330 140,318 130,305 C 118,288 108,270 100,252
               C 92,234 88,214 86,195 C 84,175 86,155 90,138
               C 88,120 84,104 78,90 C 72,76 72,62 80,50
               C 90,38 108,28 125,23 Z"
            fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5"
          />
          {/* NE bump */}
          <path
            d="M 255,112 C 260,98 268,82 275,72 C 282,62 276,50 265,44 C 255,38 243,42 238,52"
            fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5"
          />
          {/* Gujarat bump */}
          <path
            d="M 86,138 C 78,143 66,148 56,150 C 44,153 38,146 38,133 C 38,118 46,106 57,97 C 66,88 78,86 84,90"
            fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5"
          />
          {/* Tamil Nadu highlight */}
          <polygon
            points="160,338 148,320 136,300 128,282 132,265 142,254 155,246 168,252 180,264 192,280 200,300 195,316 182,329 170,336"
            fill="currentColor" opacity="0.15"
          />
          {/* Karnataka highlight */}
          <polygon
            points="128,282 118,268 110,252 110,236 116,222 124,210 134,203 144,198 154,202 160,212 165,226 168,252 155,246 142,254 132,265"
            fill="currentColor" opacity="0.07"
          />
          {/* Follower bubbles */}
          {markers.map(({ state, count, x, y }) => (
            <g key={state}>
              <circle
                cx={x}
                cy={y}
                r={Math.max(12, (count / max) * 30)}
                fill="currentColor"
                opacity="0.9"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                {count}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 pt-1">
          {Object.entries(stateCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([state, count]) => (
              <div key={state} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-foreground/70 truncate">{state}</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-1.5 rounded-full bg-foreground/70"
                    style={{ width: `${Math.max(16, (count / max) * 60)}px` }}
                  />
                  <span className="text-[11px] font-semibold text-foreground tabular-nums">{count}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default function FollowersPage() {
  const { activeTenantId } = useAppStore()
  const { data: followers, isLoading } = useFollowers(activeTenantId)
  const tenant = MOCK_TENANTS.find(t => t.id === activeTenantId)
  const [search, setSearch] = useState('')

  const sorted = useMemo(() => {
    if (!followers) return []
    return [...followers]
      .sort((a, b) => {
        const ra = a.leaderRelationships.find(r => r.tenantId === activeTenantId)?.activityCount ?? 0
        const rb = b.leaderRelationships.find(r => r.tenantId === activeTenantId)?.activityCount ?? 0
        return rb - ra
      })
      .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.location?.toLowerCase().includes(search.toLowerCase()))
  }, [followers, activeTenantId, search])

  const stateCounts = useMemo(() => {
    if (!followers) return {}
    return followers.reduce<Record<string, number>>((acc, f) => {
      const s = getState(f.location)
      if (s) acc[s] = (acc[s] || 0) + 1
      return acc
    }, {})
  }, [followers])

  return (
    <div>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Followers</h1>
            {tenant && (
              <p className="text-xs text-foreground/50">
                {formatCount(tenant.followerCount)} following Sridhar
              </p>
            )}
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="search"
              placeholder="Search followers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-muted text-sm placeholder:text-foreground/40 focus:outline-none border border-transparent focus:border-foreground/20"
            />
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Map */}
        {!isLoading && Object.keys(stateCounts).length > 0 && (
          <IndiaMap stateCounts={stateCounts} />
        )}

        {/* Top followers label */}
        {!isLoading && sorted.length > 0 && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/40 pt-1">
            Top followers by engagement
          </p>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : !sorted.length ? (
          <EmptyState
            icon={<Users size={48} />}
            title="No followers yet"
            description="Share your Mission to invite people to follow your journey."
          />
        ) : (
          <div className="divide-y divide-border/50">
            {sorted.map((follower, i) => {
              const rel = follower.leaderRelationships.find(r => r.tenantId === activeTenantId)
              const phone = MOCK_PHONES[follower.id]
              return (
                <motion.div
                  key={follower.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-2 py-2"
                >
                  <Link
                    href={`/leader/followers/${follower.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0 hover:bg-muted/50 rounded-xl px-2 py-1.5 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <Avatar src={follower.avatarUrl} name={follower.name} size="md" />
                      {i < 3 && (
                        <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-foreground text-background text-[9px] font-black flex items-center justify-center">
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{follower.name}</p>
                      <p className="text-xs text-foreground/50 truncate">{follower.occupation ?? follower.location ?? ''}</p>
                    </div>
                    {rel?.activityCount ? (
                      <span className="text-[11px] font-medium text-foreground/50 shrink-0">
                        {rel.activityCount} pts
                      </span>
                    ) : null}
                  </Link>
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/50 hover:text-foreground shrink-0"
                      aria-label={`Call ${follower.name}`}
                    >
                      <Phone size={16} />
                    </a>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
