'use client'
import { motion } from 'framer-motion'
import { Cake, Bell, Lightning } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useUpcomingBirthdays, useFollowUps, useAISuggestions } from '@/queries'
import { formatShortDate } from '@/lib/formatting'
import Link from 'next/link'

export function AttentionStrip() {
  const { activeTenantId, userRole } = useAppStore()
  const { data: birthdays } = useUpcomingBirthdays(activeTenantId, userRole)
  const { data: followUps } = useFollowUps(activeTenantId, userRole)
  const { data: aiSuggestions } = useAISuggestions(activeTenantId)

  const highPriority = aiSuggestions?.filter(s => s.priority === 'high' && !s.dismissed) ?? []

  const cards = [
    ...(birthdays?.slice(0, 2).map(c => ({
      id: `bday-${c.id}`,
      icon: <Cake size={28} weight="fill" className="text-rose-400" />,
      title: c.name,
      subtitle: `Birthday ${formatShortDate(c.importantDates[0]?.date ?? '')}`,
      href: `/leader/contacts/${c.id}`,
    })) ?? []),
    ...(followUps?.slice(0, 2).map(c => ({
      id: `fu-${c.id}`,
      icon: <Lightning size={28} weight="fill" className="text-amber-400" />,
      title: c.name,
      subtitle: c.nextFollowUpNote ?? 'Follow up needed',
      href: `/leader/contacts/${c.id}`,
    })) ?? []),
    ...(highPriority.slice(0, 2).map(s => ({
      id: s.id,
      icon: <Bell size={28} weight="fill" className="text-violet-400" />,
      title: s.title,
      subtitle: s.body.slice(0, 60) + '…',
      href: s.targetType === 'contact' ? `/leader/contacts/${s.targetId}` : '/leader/home',
    }))),
  ]

  if (cards.length === 0) return null

  return (
    <section aria-label="Attention items">
      <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">
        Needs attention
      </h2>
      {/* pt-3 gives headroom so the floating icon isn't clipped */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="snap-start shrink-0"
          >
            <Link
              href={card.href}
              className="attention-card flex items-center gap-3 px-4 bg-white dark:bg-card rounded-2xl w-[220px] h-[72px] shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <span className="attention-icon shrink-0">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">{card.title}</p>
                <p className="text-xs text-foreground/50 truncate mt-0.5">{card.subtitle}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
