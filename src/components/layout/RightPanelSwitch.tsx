'use client'
import { usePathname } from 'next/navigation'
import { RightPanel } from './RightPanel'
import { FollowersRightPanel } from './FollowersRightPanel'
import { ReelsRightPanel } from './ReelsRightPanel'
import { MissionRightPanel } from './MissionRightPanel'
import { EventsRightPanel } from './EventsRightPanel'
import { CompaniesRightPanel } from './CompaniesRightPanel'
import { OpportunitiesRightPanel } from './OpportunitiesRightPanel'
import { ProfileRightPanel } from './ProfileRightPanel'

/**
 * Chooses the right-hand panel for the current route.
 *
 * The layout is a server component, so the pathname check lives here. Pages
 * with their own audience-specific panel opt in below; everything else keeps
 * the general briefing panel.
 */
export function RightPanelSwitch() {
  const pathname = usePathname()

  if (pathname.startsWith('/leader/followers')) return <FollowersRightPanel />
  if (pathname.startsWith('/leader/reels')) return <ReelsRightPanel />
  if (pathname.startsWith('/leader/mission')) return <MissionRightPanel />
  if (pathname.startsWith('/leader/events')) return <EventsRightPanel />
  if (pathname.startsWith('/leader/projects')) return <CompaniesRightPanel />
  if (pathname.startsWith('/leader/opportunities')) return <OpportunitiesRightPanel />
  if (pathname.startsWith('/leader/profile')) return <ProfileRightPanel />

  return <RightPanel />
}
