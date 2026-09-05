import {
  HouseSimple, FilmStrip, AddressBook, Target, CalendarBlank,
  Briefcase, Star, Users, ChatCircleDots, Bell, Sparkle,
} from '@phosphor-icons/react'

export interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

/** Single source of truth for the primary destinations — used by the desktop
 *  sidebar and by the mobile "More" sheet so the two cannot drift apart. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/leader/home', icon: HouseSimple, label: 'Home' },
  { href: '/leader/contacts', icon: AddressBook, label: 'My Contacts' },
  { href: '/leader/ai', icon: Sparkle, label: 'AI' },
  { href: '/leader/messages', icon: ChatCircleDots, label: 'Messages' },
  { href: '/leader/notifications', icon: Bell, label: 'Notifications' },
  { href: '/leader/reels', icon: FilmStrip, label: 'Reels' },
  { href: '/leader/mission', icon: Target, label: 'Mission' },
  { href: '/leader/followers', icon: Users, label: 'Followers' },
  { href: '/leader/events', icon: CalendarBlank, label: 'Events' },
  { href: '/leader/projects', icon: Briefcase, label: 'Organizations' },
  { href: '/leader/opportunities', icon: Star, label: 'Opportunities' },
]

/** The four that get their own slot in the mobile bottom bar. */
export const MOBILE_PRIMARY_HREFS = [
  '/leader/home',
  '/leader/messages',
  '/leader/mission',
  '/leader/contacts',
]
