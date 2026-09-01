import {
  House, FilmStrip, AddressBook, User, Target, CalendarBlank,
  Briefcase, Star, Users,
} from '@phosphor-icons/react'

export interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

/** Single source of truth for the primary destinations — used by the desktop
 *  sidebar and by the mobile "More" sheet so the two cannot drift apart. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/leader/home', icon: House, label: 'Home' },
  { href: '/leader/followers', icon: Users, label: 'Followers' },
  { href: '/leader/contacts', icon: AddressBook, label: 'Contacts' },
  { href: '/leader/reels', icon: FilmStrip, label: 'Reels' },
  { href: '/leader/mission', icon: Target, label: 'Mission' },
  { href: '/leader/events', icon: CalendarBlank, label: 'Events' },
  { href: '/leader/projects', icon: Briefcase, label: 'Companies' },
  { href: '/leader/opportunities', icon: Star, label: 'Opportunities' },
  { href: '/leader/profile', icon: User, label: 'Profile' },
]

/** The four that get their own slot in the mobile bottom bar. */
export const MOBILE_PRIMARY_HREFS = [
  '/leader/home',
  '/leader/reels',
  '/leader/contacts',
  '/leader/profile',
]
