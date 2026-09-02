'use client'
import { useState } from 'react'
import { HandHeart, Check, ShareNetwork } from '@phosphor-icons/react'
import { formatNumber } from '@/lib/formatting'
import { cn } from '@/lib/utils'

interface Props {
  missionTitle: string
  /** People already backing the mission, before this visitor. */
  supporterCount: number
}

/**
 * Closing call to action for the mission.
 *
 * "Join" rather than "Support" because the ask is participation, not money —
 * the mission is about people showing up in their own districts. Joining is
 * local state here; wiring it up means a membership mutation.
 */
export function JoinMissionCta({ missionTitle, supporterCount }: Props) {
  const [joined, setJoined] = useState(false)
  const total = supporterCount + (joined ? 1 : 0)

  return (
    <section
      aria-label="Join this mission"
      className="rounded-2xl border bg-card overflow-hidden"
    >
      <div className="p-5 sm:p-6 text-center">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 mb-3">
          <HandHeart size={22} weight="fill" className="text-primary" />
        </span>
        <h2 className="text-lg font-bold text-foreground">Join the {missionTitle} mission</h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Back this work in your own district — volunteer at an event, refer talent, or open a door
          for a rural company. You will get mission updates as they happen.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => setJoined(v => !v)}
            aria-pressed={joined}
            className={cn(
              'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors',
              joined
                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {joined ? <Check size={16} weight="bold" /> : <HandHeart size={16} weight="fill" />}
            {joined ? 'You have joined' : 'Join the mission'}
          </button>
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold text-foreground hover:bg-muted transition-colors">
            <ShareNetwork size={16} />
            Share
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground tabular-nums">
          {formatNumber(total)} people have joined
          {joined && <span className="text-primary font-medium"> — including you</span>}
        </p>
      </div>
    </section>
  )
}
