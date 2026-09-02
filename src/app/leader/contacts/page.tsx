'use client'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlass, AddressBook, Plus, ShieldCheck, Lock, X } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useUIStore } from '@/stores/uiStore'
import { useContacts } from '@/queries'
import { ContactListItem } from '@/components/contacts/ContactListItem'
import { ContactCardSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { CONTACT_CATEGORY_LABELS, type ContactCategory } from '@/types/contact'
import { cn } from '@/lib/utils'

/** The Personal tab is its own filter rather than a category pill. */
type Tab = 'all' | 'personal' | ContactCategory

export default function ContactsPage() {
  const { activeTenantId, userRole } = useAppStore()
  const { contactSearchQuery, setContactSearch } = useUIStore()
  const { data: contacts, isLoading } = useContacts(activeTenantId, userRole)
  const [tab, setTab] = useState<Tab>('all')

  /** Only the leader gets a Personal tab. The data layer already withholds
   *  leader_only contacts from every other role, so this hides a tab that
   *  would otherwise always be empty rather than being the security boundary. */
  const canSeePersonal = userRole === 'leader'

  const personalCount = useMemo(
    () => (contacts ?? []).filter(c => c.categories.includes('personal')).length,
    [contacts]
  )

  /** Category pills, excluding personal — it has its own tab. */
  const categories = useMemo(() => {
    const set = new Set<ContactCategory>()
    for (const c of contacts ?? []) {
      for (const cat of c.categories) if (cat !== 'personal') set.add(cat)
    }
    return [...set].sort((a, b) => CONTACT_CATEGORY_LABELS[a].localeCompare(CONTACT_CATEGORY_LABELS[b]))
  }, [contacts])

  const filtered = useMemo(() => {
    const q = contactSearchQuery.trim().toLowerCase()
    return (contacts ?? []).filter(c => {
      // "All" deliberately excludes personal contacts — they live in their own tab.
      if (tab === 'all' && c.categories.includes('personal')) return false
      if (tab === 'personal' && !c.categories.includes('personal')) return false
      if (tab !== 'all' && tab !== 'personal' && !c.categories.includes(tab)) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.organization?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
      )
    })
  }, [contacts, contactSearchQuery, tab])

  const pill = (active: boolean) =>
    cn(
      'text-xs px-3 py-1.5 rounded-full font-medium border transition-colors',
      active
        ? 'bg-foreground text-background border-foreground'
        : 'bg-transparent text-foreground/60 border-border hover:bg-muted hover:text-foreground'
    )

  return (
    <div>
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Private to you — no one else in the system can see these.
            </p>
          </div>
          <button className="shrink-0 inline-flex items-center gap-1.5 bg-foreground text-background px-3.5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus size={15} weight="bold" />
            Add
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="search"
              placeholder="Search by name, role, organisation or place…"
              value={contactSearchQuery}
              onChange={e => setContactSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-full bg-muted/60 text-sm placeholder:text-foreground/40 focus:outline-none border border-transparent focus:border-foreground/20 focus:bg-transparent transition-colors"
            />
            {contactSearchQuery && (
              <button
                onClick={() => setContactSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={13} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs — wrap across the full width rather than scrolling sideways */}
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          <button onClick={() => setTab('all')} className={pill(tab === 'all')}>
            All
          </button>

          {canSeePersonal && (
            <button
              onClick={() => setTab('personal')}
              className={cn(pill(tab === 'personal'), 'inline-flex items-center gap-1.5')}
            >
              <Lock size={11} weight="fill" />
              Personal
              {personalCount > 0 && (
                <span className={cn('tabular-nums', tab === 'personal' ? 'text-background/70' : 'text-foreground/40')}>
                  {personalCount}
                </span>
              )}
            </button>
          )}

          {categories.map(cat => (
            <button key={cat} onClick={() => setTab(cat)} className={pill(tab === cat)}>
              {CONTACT_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pb-6">
        {/* A standing reminder, but only where it actually applies */}
        {tab === 'personal' && (
          <div className="flex items-start gap-2.5 mb-4 p-3 rounded-xl border border-border bg-muted/40">
            <ShieldCheck size={15} weight="fill" className="mt-0.5 shrink-0 text-foreground/50" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              These are your personal contacts. They are stored as
              <span className="font-medium text-foreground"> leader-only</span>, so team members and
              followers never receive them — not in this list, and not through the API.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map(i => <ContactCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<AddressBook size={44} />}
            title={tab === 'personal' ? 'No personal contacts yet' : 'No contacts found'}
            description={
              contactSearchQuery
                ? 'Try a different search term.'
                : tab === 'personal'
                  ? 'Contacts you mark as personal stay visible only to you.'
                  : 'Your relationship network starts here.'
            }
          />
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
              {tab !== 'all' && tab !== 'personal' && ` in ${CONTACT_CATEGORY_LABELS[tab]}`}
            </p>
            <div className="grid gap-3 xl:grid-cols-2">
              {filtered.map((contact, i) => (
                <motion.div
                  key={contact.id}
                  className="min-w-0"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.3) }}
                >
                  <ContactListItem contact={contact} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
