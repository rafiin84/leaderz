'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { MagnifyingGlass, AddressBook, Plus, ShieldCheck, Lock, X, SquaresFour, Rows, MapPin, CaretDown } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useUIStore } from '@/stores/uiStore'
import { useContacts } from '@/queries'
import { ContactListItem } from '@/components/contacts/ContactListItem'
import { ContactTable } from '@/components/contacts/ContactTable'
import { ContactCardSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { CONTACT_CATEGORY_LABELS, type ContactCategory } from '@/types/contact'
import { cn } from '@/lib/utils'

/** The Personal tab is its own filter rather than a category pill. */
type Tab = 'all' | 'personal' | ContactCategory

/** Contact locations are free-text "District, State" (a couple are just a
 *  state/UT with no district, e.g. "New Delhi"). */
function parseLocation(location?: string): { district?: string; state: string } | null {
  if (!location) return null
  const parts = location.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) return null
  if (parts.length === 1) return { state: parts[0] }
  return { district: parts[0], state: parts[parts.length - 1] }
}

export default function ContactsPage() {
  const { activeTenantId, userRole } = useAppStore()
  const { contactSearchQuery, setContactSearch } = useUIStore()
  const { data: contacts, isLoading } = useContacts(activeTenantId, userRole)
  const [tab, setTab] = useState<Tab>('all')
  const [view, setView] = useState<'cards' | 'table'>('table')
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationPos, setLocationPos] = useState({ top: 0, left: 0 })
  const locationButtonRef = useRef<HTMLButtonElement>(null)
  const locationPanelRef = useRef<HTMLDivElement>(null)

  function toggleLocationOpen() {
    if (!locationOpen && locationButtonRef.current) {
      const rect = locationButtonRef.current.getBoundingClientRect()
      setLocationPos({ top: rect.bottom + 8, left: rect.left })
    }
    setLocationOpen(v => !v)
  }

  // The trigger button lives inside a horizontally-scrolling pills row, whose
  // overflow-x also clips overflow-y — so the panel is portaled to <body> and
  // positioned fixed from the button's rect instead of nesting inside it.
  useEffect(() => {
    if (!locationOpen) return
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (
        locationButtonRef.current && !locationButtonRef.current.contains(target) &&
        locationPanelRef.current && !locationPanelRef.current.contains(target)
      ) {
        setLocationOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLocationOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [locationOpen])

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

  /** States (and their districts) actually present in the contact list. */
  const statesToDistricts = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const c of contacts ?? []) {
      const loc = parseLocation(c.location)
      if (!loc) continue
      if (!map.has(loc.state)) map.set(loc.state, new Set())
      if (loc.district) map.get(loc.state)!.add(loc.district)
    }
    return map
  }, [contacts])

  const states = useMemo(
    () => [...statesToDistricts.keys()].sort((a, b) => a.localeCompare(b)),
    [statesToDistricts]
  )
  const districtsForSelectedState = useMemo(
    () => (selectedState ? [...(statesToDistricts.get(selectedState) ?? [])].sort((a, b) => a.localeCompare(b)) : []),
    [statesToDistricts, selectedState]
  )

  function selectState(state: string | null) {
    setSelectedState(state)
    setSelectedDistrict(null)
    if (!state || (statesToDistricts.get(state)?.size ?? 0) === 0) setLocationOpen(false)
  }
  function selectDistrict(district: string | null) {
    setSelectedDistrict(district)
    setLocationOpen(false)
  }

  const filtered = useMemo(() => {
    const q = contactSearchQuery.trim().toLowerCase()
    return (contacts ?? []).filter(c => {
      // "All" deliberately excludes personal contacts — they live in their own tab.
      if (tab === 'all' && c.categories.includes('personal')) return false
      if (tab === 'personal' && !c.categories.includes('personal')) return false
      if (tab !== 'all' && tab !== 'personal' && !c.categories.includes(tab)) return false
      if (selectedState || selectedDistrict) {
        const loc = parseLocation(c.location)
        if (!loc) return false
        if (selectedState && loc.state !== selectedState) return false
        if (selectedDistrict && loc.district !== selectedDistrict) return false
      }
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.organization?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
      )
    })
  }, [contacts, contactSearchQuery, tab, selectedState, selectedDistrict])

  const pill = (active: boolean) =>
    cn(
      'shrink-0 whitespace-nowrap text-xs px-3 py-1.5 rounded-full font-medium border transition-colors',
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
          </div>
          {/* Cards for scanning, table for packing more rows on screen. */}
          <div className="shrink-0 flex items-center rounded-full border p-0.5" role="group" aria-label="View">
            {([
              { id: 'cards' as const, icon: SquaresFour, label: 'Card view' },
              { id: 'table' as const, icon: Rows, label: 'Table view' },
            ]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                aria-label={label}
                aria-pressed={view === id}
                title={label}
                className={cn(
                  'p-1.5 rounded-full transition-colors',
                  view === id ? 'bg-foreground text-background' : 'text-foreground/50 hover:text-foreground'
                )}
              >
                <Icon size={15} weight={view === id ? 'fill' : 'regular'} />
              </button>
            ))}
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

        {/* One scrolling line — the category set is long enough to wrap onto
            three rows otherwise. */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {/* State/district filter */}
          <div className="relative shrink-0">
            <button
              ref={locationButtonRef}
              onClick={toggleLocationOpen}
              className={cn(pill(Boolean(selectedState)), 'inline-flex items-center gap-1')}
            >
              <MapPin size={11} weight={selectedState ? 'fill' : 'regular'} />
              {selectedDistrict ?? selectedState ?? 'Location'}
              <CaretDown size={10} weight="bold" className={cn('transition-transform', locationOpen && 'rotate-180')} />
            </button>
            {locationOpen && createPortal(
              <div
                ref={locationPanelRef}
                style={{ position: 'fixed', top: locationPos.top, left: locationPos.left }}
                className="z-50 w-72 max-h-80 overflow-y-auto bg-card border border-border rounded-2xl shadow-xl p-2"
              >
                <button
                  onClick={() => selectState(null)}
                  className={cn(
                    'w-full text-left text-sm px-2.5 py-2 rounded-xl hover:bg-muted transition-colors',
                    !selectedState && 'text-primary font-medium'
                  )}
                >
                  All locations
                </button>
                {states.map(state => (
                  <div key={state}>
                    <button
                      onClick={() => selectState(state)}
                      className={cn(
                        'w-full text-left text-sm px-2.5 py-2 rounded-xl hover:bg-muted transition-colors',
                        selectedState === state && !selectedDistrict && 'text-primary font-medium'
                      )}
                    >
                      {state}
                    </button>
                    {selectedState === state && districtsForSelectedState.length > 0 && (
                      <div className="pl-4 pb-1">
                        <button
                          onClick={() => selectDistrict(null)}
                          className={cn(
                            'w-full text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground',
                            !selectedDistrict && 'text-primary font-medium'
                          )}
                        >
                          All of {state}
                        </button>
                        {districtsForSelectedState.map(district => (
                          <button
                            key={district}
                            onClick={() => selectDistrict(district)}
                            className={cn(
                              'w-full text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground',
                              selectedDistrict === district && 'text-primary font-medium'
                            )}
                          >
                            {district}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>,
              document.body
            )}
          </div>

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
              {selectedDistrict ? ` in ${selectedDistrict}, ${selectedState}` : selectedState ? ` in ${selectedState}` : ''}
            </p>
            {view === 'table' ? (
              <ContactTable contacts={filtered} />
            ) : (
              <div className="grid gap-3 xl:grid-cols-2">
                {filtered.map((contact, i) => (
                  <motion.div
                    key={contact.id}
                    className="min-w-0 h-full"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.3) }}
                  >
                    <ContactListItem contact={contact} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
