'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, FilmStrip, AddressBook, User } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/leader/home', icon: House, label: 'Home' },
  { href: '/leader/reels', icon: FilmStrip, label: 'Reels' },
  { href: '/leader/contacts', icon: AddressBook, label: 'Contacts' },
  { href: '/leader/profile', icon: User, label: 'Profile' },
]

export function LeaderBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t safe-bottom"
      style={{ height: 'calc(68px + env(safe-area-inset-bottom))' }}
      aria-label="Main navigation"
    >
      <div className="flex items-center h-[68px] max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 group"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon
                size={22}
                weight={isActive ? 'fill' : 'regular'}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className={cn('text-[10px] font-medium transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
