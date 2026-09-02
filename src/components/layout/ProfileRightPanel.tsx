'use client'
import Link from 'next/link'
import { Users, Article, FilmStrip, UsersThree, Target, ShieldCheck, MapPin, Link as LinkIcon } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useLeader, useMission, useTeam } from '@/queries'
import { MOCK_TENANTS } from '@/data/mock/leaders'
import { Avatar } from '@/components/common/Avatar'
import { formatNumber } from '@/lib/formatting'
import { PanelShell, PanelHeading, StatTile } from './panelPrimitives'

const ROLE_LABELS: Record<string, string> = {
  leader: 'Leader',
  team_admin: 'Team admin',
  team_relationship_manager: 'Relationship manager',
  team_content_manager: 'Content manager',
  team_event_manager: 'Event manager',
  team_moderator: 'Moderator',
  follower: 'Follower',
}

/**
 * Right panel for the Profile page: who is signed in, their reach, and the
 * access their role carries — rather than the home briefing.
 */
export function ProfileRightPanel() {
  const { activeTenantId, userRole } = useAppStore()
  const { data: leader } = useLeader(activeTenantId)
  const { data: mission } = useMission(activeTenantId)
  const { data: team } = useTeam(activeTenantId)
  const tenant = MOCK_TENANTS.find(t => t.id === activeTenantId)

  return (
    <PanelShell>
      {/* Identity */}
      <section className="mb-6">
        <Avatar
          src={leader?.avatarUrl ?? tenant?.avatarUrl}
          name={leader?.name ?? tenant?.leaderName ?? ''}
          size="xl"
          verified={leader?.isVerified}
        />
        <p className="mt-3 text-lg font-black tracking-tight text-foreground leading-tight">
          {leader?.name ?? tenant?.leaderName}
        </p>
        <p className="text-xs text-muted-foreground">
          {leader?.title}
          {leader?.title && leader?.organization ? ' · ' : ''}
          {leader?.organization}
        </p>
        {leader?.location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={11} weight="fill" />
            {leader.location}
          </p>
        )}
        {leader?.website && (
          <a
            href={leader.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <LinkIcon size={11} />
            {leader.website.replace(/^https?:\/\//, '')}
          </a>
        )}
      </section>

      {/* Reach */}
      <section className="mb-6">
        <PanelHeading>Reach</PanelHeading>
        <dl className="grid grid-cols-2 gap-2">
          <StatTile icon={Users} label="Followers" value={formatNumber(tenant?.followerCount ?? 0)} />
          <StatTile icon={Article} label="Posts" value={leader?.postCount ?? 0} />
          <StatTile icon={FilmStrip} label="Reels" value={leader?.reelCount ?? 0} />
          <StatTile icon={UsersThree} label="Team" value={team?.length ?? 0} />
        </dl>
      </section>

      {/* Mission */}
      {mission && (
        <section className="mb-6">
          <PanelHeading href="/leader/mission">Mission</PanelHeading>
          <Link
            href="/leader/mission"
            className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
          >
            <Target size={14} weight="fill" className="mt-0.5 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground truncate">{mission.title}</span>
              <span className="block text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                {mission.statement}
              </span>
            </span>
          </Link>
        </section>
      )}

      {/* Access */}
      <section>
        <PanelHeading>Access</PanelHeading>
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="flex items-start gap-2">
            <ShieldCheck size={13} weight="fill" className="mt-0.5 shrink-0 text-foreground/40" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{ROLE_LABELS[userRole] ?? userRole}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                {userRole === 'leader'
                  ? 'Full access, including personal contacts, which no team role can see.'
                  : 'Team access. Personal and leader-only records are withheld from this role.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </PanelShell>
  )
}
