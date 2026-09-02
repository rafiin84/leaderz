'use client'
import { usePathname } from 'next/navigation'
import { RightPanel } from './RightPanel'
import { FollowersRightPanel } from './FollowersRightPanel'
import { ReelsRightPanel } from './ReelsRightPanel'

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

  return <RightPanel />
}
