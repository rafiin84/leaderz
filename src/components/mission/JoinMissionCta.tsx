'use client'
import { useState } from 'react'
import { HandHeart, Check, ShareNetwork } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useFollowers } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { formatNumber } from '@/lib/formatting'
import { cn } from '@/lib/utils'

interface Props {
  missionTitle: string
  /** People already backing the mission, before this visitor. */
  supporterCount: number
}

/**
 * Call to action for the mission.
 *
 * "Join" rather than "Support" because the ask is participation, not money —
 * the mission is about people showing up in their own districts. Joining is
 * local state here; wiring it up means a membership mutation.
 */
export function JoinMissionCta({ missionTitle, supporterCount }: Props) {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: followers } = useFollowers(activeTenantId)
  const [joined, setJoined] = useState(false)

  const total = supporterCount + (joined ? 1 : 0)
  /** A few real faces read as more credible than a bare number. */
  const faces = (followers ?? []).filter(f => f.avatarUrl).slice(0, 4)

  return (
    <section
      aria-label="Join this mission"
      className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/[0.06]"
    >
      {/* Soft accent so the band reads as an invitation, not another data card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl"
      />

      <div className="relative p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-full bg-primary text-primary-foreground">
          <HandHeart size={22} weight="fill" />
        </span>

        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
            Join the {missionTitle} mission
          </h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Volunteer at an event, refer talent, or open a door for a rural company — and get
            mission updates as they happen.
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            {faces.length > 0 && (
              <span className="flex -space-x-2">
                {faces.map(f => (
                  <Avatar
                    key={f.id}
                    src={f.avatarUrl}
                    name={f.name}
                    size="xs"
                    className="ring-2 ring-background rounded-full"
                  />
                ))}
              </span>
            )}
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatNumber(total)} have joined
              {joined && <span className="font-medium text-primary"> — including you</span>}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setJoined(v => !v)}
            aria-pressed={joined}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors',
              joined
                ? 'bg-primary/15 text-primary hover:bg-primary/25'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {joined ? <Check size={16} weight="bold" /> : <HandHeart size={16} weight="fill" />}
            {joined ? 'Joined' : 'Join'}
          </button>
          <button
            aria-label="Share this mission"
            className="inline-flex items-center justify-center p-2.5 rounded-full border border-primary/25 bg-background/60 text-foreground hover:bg-background transition-colors"
          >
            <ShareNetwork size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
