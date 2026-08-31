'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlass, AddressBook, Plus, ShieldCheck } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useUIStore } from '@/stores/uiStore'
import { useContacts } from '@/queries'
import { ContactCard } from '@/components/contacts/ContactCard'
import { ContactCardSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { CONTACT_CATEGORY_LABELS, type ContactCategory } from '@/types/contact'

export default function ContactsPage() {
  const { activeTenantId, userRole } = useAppStore()
  const { contactSearchQuery, contactCategoryFilter, setContactSearch, setContactCategoryFilter } = useUIStore()
  const { data: contacts, isLoading } = useContacts(activeTenantId, userRole)

  const filtered = useMemo(() => {
    if (!contacts) return []
    return contacts.filter(c => {
      const q = contactSearchQuery.toLowerCase()
      if (q && !c.name.toLowerCase().includes(q) && !c.organization?.toLowerCase().includes(q) && !c.title?.toLowerCase().includes(q)) return false
      if (contactCategoryFilter && !c.categories.includes(contactCategoryFilter as ContactCategory)) return false
      return true
    })
  }, [contacts, contactSearchQuery, contactCategoryFilter])

  const categories = useMemo(() => {
    if (!contacts) return []
    const catSet = new Set<ContactCategory>()
    contacts.forEach(c => c.categories.forEach(cat => catSet.add(cat)))
    return Array.from(catSet)
  }, [contacts])

  return (
    <div>
      {/* Privacy banner */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-muted/60 border-b">
        <ShieldCheck size={13} weight="fill" className="text-foreground/60 shrink-0" />
        <p className="text-[11px] font-semibold tracking-wide text-foreground/60 uppercase">
          No one in the system can see these contacts other than you.
        </p>
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <h1 className="text-xl font-bold flex-1">Contacts</h1>
          <button className="flex items-center gap-1.5 border border-foreground/20 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-muted transition-colors">
            <Plus size={14} weight="bold" />
            Add
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="search"
              placeholder="Search contacts…"
              value={contactSearchQuery}
              onChange={e => setContactSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-muted text-sm placeholder:text-foreground/40 focus:outline-none border border-transparent focus:border-foreground/20"
            />
          </div>
        </div>

        {/* Category filter — monochrome pills */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          <button
            onClick={() => setContactCategoryFilter(null)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
              !contactCategoryFilter
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-foreground/60 border-border hover:bg-muted'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setContactCategoryFilter(contactCategoryFilter === cat ? null : cat)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                contactCategoryFilter === cat
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-foreground/60 border-border hover:bg-muted'
              }`}
            >
              {CONTACT_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map(i => <ContactCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<AddressBook size={48} />}
            title="No contacts found"
            description={contactSearchQuery ? 'Try a different search term.' : 'Your relationship network starts here.'}
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-foreground/40 mb-3">{filtered.length} contact{filtered.length !== 1 ? 's' : ''}</p>
            <div className="space-y-0.5">
              {filtered.map((contact, i) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <ContactCard contact={contact} compact />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
