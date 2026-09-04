'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Phone, EnvelopeSimple, Note, Lightning, Cake, Clock, Lock, MapPin,
  Star, DotsThree, CheckCircle, WhatsappLogo, VideoCamera, FileText, SquaresFour,
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useContact } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { PrivacyBadge } from '@/components/common/PrivacyBadge'
import { Skeleton } from '@/components/common/Skeleton'
import { LogInteractionSheet } from '@/components/contacts/LogInteractionSheet'
import { WhatsAppComposer } from '@/components/contacts/WhatsAppComposer'
import { EmailComposer } from '@/components/contacts/EmailComposer'
import { NotesComposer } from '@/components/contacts/NotesComposer'
import { VideoCallPicker } from '@/components/contacts/VideoCallPicker'
import { ContactActionsSheet, type ContactAction } from '@/components/contacts/ContactActionsSheet'
import { CONTACT_CATEGORY_LABELS } from '@/types/contact'
import { formatDate, formatShortDate, formatRelativeTime } from '@/lib/formatting'
import { cn } from '@/lib/utils'
import { telHref } from '@/lib/contactActions'
import type { ContactNote, ContactInteraction } from '@/types/contact'

type TabId = 'overview' | 'relationship' | 'dates' | 'notes' | 'activities' | 'documents'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'relationship', label: 'Relationship' },
  { id: 'dates', label: 'Key Dates' },
  { id: 'notes', label: 'Notes' },
  { id: 'activities', label: 'Activities' },
  { id: 'documents', label: 'Documents' },
]

export default function ContactDetailClient() {
  const params = useParams()
  const router = useRouter()
  const { activeTenantId, userRole } = useAppStore()
  const contactId = params.id as string
  const { data: contact, isLoading } = useContact(activeTenantId, contactId, userRole)

  const [tab, setTab] = useState<TabId>('overview')
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [whatsAppOpen, setWhatsAppOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)

  const [addedNotes, setAddedNotes] = useState<ContactNote[]>([])
  const [addedInteractions, setAddedInteractions] = useState<ContactInteraction[]>([])

  function handleCall() {
    if (!contact?.phone) return
    window.location.href = telHref(contact.phone)
  }

  function saveNote(content: string) {
    if (!contact) return
    const now = new Date().toISOString()
    setAddedNotes(prev => [
      { id: `note-${Date.now()}`, content, privacyLevel: contact.privacyLevel, createdAt: now, updatedAt: now },
      ...prev,
    ])
    setAddedInteractions(prev => [
      { id: `int-${Date.now()}`, type: 'note', summary: content, date: now, sentiment: 'neutral' },
      ...prev,
    ])
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex items-start gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="w-full max-w-3xl px-4 py-16 text-center">
        <Lock size={48} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Contact not accessible</h2>
        <p className="text-sm text-muted-foreground mb-4">This contact is restricted to a higher access level.</p>
        <button onClick={() => router.back()} className="text-primary text-sm font-medium">Go back</button>
      </div>
    )
  }

  const isLeaderOnly = contact.privacyLevel === 'leader_only'
  const allNotes = [...addedNotes, ...contact.notes]
  const allInteractions = [...addedInteractions, ...contact.interactions]

  const counts: Partial<Record<TabId, number>> = {
    notes: allNotes.length,
    activities: allInteractions.length,
  }

  const quickActions: ContactAction[] = [
    ...(contact.phone ? [{
      key: 'whatsapp', icon: WhatsappLogo, label: 'WhatsApp', sub: contact.phone,
      color: 'text-[#128C4A] dark:text-[#25D366]', bg: 'bg-[#25D366]/15', onSelect: () => setWhatsAppOpen(true),
    }] : []),
    ...(contact.phone ? [{
      key: 'call', icon: Phone, label: 'Call', sub: contact.phone,
      color: 'text-emerald-600', bg: 'bg-emerald-500/15', onSelect: handleCall,
    }] : []),
    ...(contact.email ? [{
      key: 'email', icon: EnvelopeSimple, label: 'Email', sub: contact.email,
      color: 'text-blue-600', bg: 'bg-blue-500/15', onSelect: () => setEmailOpen(true),
    }] : []),
    {
      key: 'video', icon: VideoCamera, label: 'Video Call', sub: 'Meet or Zoom',
      color: 'text-violet-600', bg: 'bg-violet-500/15', onSelect: () => setVideoOpen(true),
    },
    {
      key: 'notes', icon: Note, label: 'Notes', sub: `${allNotes.length} saved`,
      color: 'text-amber-600', bg: 'bg-amber-500/15', onSelect: () => setNotesOpen(true),
    },
    {
      key: 'followup', icon: Lightning, label: 'Follow-up', sub: contact.nextFollowUpDate ? formatShortDate(contact.nextFollowUpDate) : 'Set a reminder',
      color: 'text-orange-600', bg: 'bg-orange-500/15', onSelect: () => setFollowUpOpen(true),
    },
  ]

  return (
    <div className="w-full max-w-3xl">
      {/* Back header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold flex-1 truncate">{contact.name}</h1>
          <PrivacyBadge level={contact.privacyLevel} />
          <button className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="More options">
            <DotsThree size={20} />
          </button>
        </div>
      </header>

      {/* Leader-only banner */}
      {isLeaderOnly && (
        <div className="mx-4 mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <Lock size={16} weight="fill" />
          <p className="text-xs font-medium">Leader Only — this contact and all notes are visible only to you.</p>
        </div>
      )}

      <div className="px-4 py-5 space-y-5">
        {/* Snapshot */}
        <section className="rounded-2xl border bg-card overflow-hidden">
          {/* Hero — identity, status and the primary CTA all live on the
              color, so the top of the page reads as one deliberate banner
              instead of a thin strip over white. */}
          <div className="relative px-5 pt-6 pb-5 bg-gradient-to-br from-neutral-900 via-emerald-950 to-emerald-800">
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            />
            <div className="relative">
              <div className="flex items-center gap-4">
                <Avatar
                  src={contact.avatarUrl}
                  name={contact.name}
                  size="2xl"
                  verified={contact.isPersonallyVerified}
                  className="ring-4 ring-white/15 shadow-lg shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold text-white">{contact.name}</h2>
                    {contact.isFavorite && <Star size={17} className="text-amber-400" weight="fill" />}
                  </div>
                  {(contact.title || contact.organization) && (
                    <p className="text-sm text-white/70 mt-0.5">
                      {contact.title}
                      {contact.title && contact.organization && ' · '}
                      {contact.organization && <span className="font-medium text-white/90">{contact.organization}</span>}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                    {contact.isPersonallyVerified && (
                      <span className="flex items-center gap-1 text-xs text-emerald-300 font-medium">
                        <CheckCircle size={13} weight="fill" />
                        Personally Verified
                      </span>
                    )}
                    {contact.location && (
                      <span className="flex items-center gap-1 text-xs text-white/60">
                        <MapPin size={12} />
                        {contact.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {contact.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {contact.categories.map(cat => (
                    <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 font-medium border border-white/10">
                      {CONTACT_CATEGORY_LABELS[cat]}
                    </span>
                  ))}
                </div>
              )}

              {(contact.lastInteractionDate || contact.nextFollowUpDate) && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {contact.lastInteractionDate && (
                    <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                      <p className="flex items-center gap-1 text-[10px] font-medium text-white/60 uppercase tracking-wide">
                        <Clock size={11} />
                        Last activity
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">{formatRelativeTime(contact.lastInteractionDate)}</p>
                    </div>
                  )}
                  {contact.nextFollowUpDate && (
                    <div className="rounded-xl bg-amber-400/15 border border-amber-400/20 p-3">
                      <p className="flex items-center gap-1 text-[10px] font-medium text-amber-300 uppercase tracking-wide">
                        <Lightning size={11} weight="fill" />
                        Next follow-up
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">{formatDate(contact.nextFollowUpDate)}</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setActionsOpen(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-neutral-900 font-semibold text-sm py-3 shadow-lg hover:bg-white/90 active:scale-[0.99] transition-all"
              >
                <SquaresFour size={18} weight="fill" />
                Quick Actions
              </button>
            </div>
          </div>

          {contact.relationshipSummary && (
            <div className="px-5 py-4 text-left">
              <p className="text-sm text-foreground leading-relaxed">{contact.relationshipSummary}</p>
            </div>
          )}
        </section>

        {/* Sub tabs */}
        <div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={cn(
                  'shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors whitespace-nowrap',
                  tab === t.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-foreground/60 border-border hover:bg-muted hover:text-foreground'
                )}
              >
                {t.label}
                {counts[t.id] !== undefined && (
                  <span className={cn('tabular-nums', tab === t.id ? 'text-background/70' : 'text-foreground/40')}>
                    {counts[t.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-4 space-y-4">
            {tab === 'overview' && (
              <>
                {contact.bio && (
                  <div className="rounded-2xl border bg-card p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">About</h3>
                    <p className="text-sm text-foreground leading-relaxed">{contact.bio}</p>
                  </div>
                )}

                {contact.howWeKnow && (
                  <div className="rounded-2xl border bg-card p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">How you know each other</h3>
                    <p className="text-sm text-foreground leading-relaxed">{contact.howWeKnow}</p>
                  </div>
                )}

                {allNotes.length > 0 && (
                  <div className="rounded-2xl border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Latest note</h3>
                      <button onClick={() => setTab('notes')} className="text-xs text-primary font-medium">View all</button>
                    </div>
                    <NoteCard note={allNotes[0]} />
                  </div>
                )}

                {allInteractions.length > 0 && (
                  <div className="rounded-2xl border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent activity</h3>
                      <button onClick={() => setTab('activities')} className="text-xs text-primary font-medium">View all</button>
                    </div>
                    <div className="space-y-3">
                      {allInteractions.slice(0, 2).map(interaction => (
                        <InteractionRow key={interaction.id} interaction={interaction} />
                      ))}
                    </div>
                  </div>
                )}

                {!contact.bio && !contact.howWeKnow && allNotes.length === 0 && allInteractions.length === 0 && (
                  <p className="text-xs text-muted-foreground px-1">Nothing logged yet — use the actions above to get started.</p>
                )}
              </>
            )}

            {tab === 'relationship' && (
              <>
                {(contact.relationshipSummary || contact.howWeKnow) && (
                  <div className="rounded-2xl border bg-card p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Relationship</h3>
                    {contact.relationshipSummary && <p className="text-sm text-foreground leading-relaxed">{contact.relationshipSummary}</p>}
                    {contact.howWeKnow && <p className="text-xs text-muted-foreground mt-2">{contact.howWeKnow}</p>}
                  </div>
                )}
                {contact.missionInvolvement && contact.missionInvolvement.length > 0 && (
                  <div className="rounded-2xl border bg-card p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Mission involvement</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {contact.missionInvolvement.map(m => (
                        <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
                {contact.tags.length > 0 && (
                  <div className="rounded-2xl border bg-card p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {contact.tags.map(t => (
                        <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">#{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {!contact.relationshipSummary && !contact.howWeKnow && !contact.tags.length && (
                  <p className="text-xs text-muted-foreground px-1">No relationship details yet.</p>
                )}
              </>
            )}

            {tab === 'dates' && (
              <div className="rounded-2xl border bg-card p-4 space-y-3">
                {contact.lastInteractionDate && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Last interaction</span>
                    <span className="text-xs font-medium ml-auto">{formatRelativeTime(contact.lastInteractionDate)}</span>
                  </div>
                )}
                {contact.nextFollowUpDate && (
                  <div className="flex items-start gap-2">
                    <Lightning size={14} className="text-amber-500 shrink-0 mt-0.5" weight="fill" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Follow up</p>
                      {contact.nextFollowUpNote && <p className="text-xs text-foreground mt-0.5">{contact.nextFollowUpNote}</p>}
                    </div>
                    <span className="text-xs font-medium text-amber-600">{formatDate(contact.nextFollowUpDate)}</span>
                  </div>
                )}
                {contact.importantDates.map(d => (
                  <div key={d.id} className="flex items-center gap-2">
                    <Cake size={14} className="text-rose-400 shrink-0" weight="fill" />
                    <span className="text-xs text-muted-foreground">{d.label}</span>
                    <span className="text-xs font-medium ml-auto">{formatShortDate(d.date)}</span>
                  </div>
                ))}
                {!contact.lastInteractionDate && !contact.nextFollowUpDate && contact.importantDates.length === 0 && (
                  <p className="text-xs text-muted-foreground">No key dates yet.</p>
                )}
              </div>
            )}

            {tab === 'notes' && (
              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</h3>
                  <button onClick={() => setNotesOpen(true)} className="text-xs text-primary font-medium">+ Add note</button>
                </div>
                {allNotes.length > 0 ? (
                  <div className="space-y-3">
                    {allNotes.map(note => <NoteCard key={note.id} note={note} />)}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No notes yet.</p>
                )}
              </div>
            )}

            {tab === 'activities' && (
              <div className="rounded-2xl border bg-card p-4">
                {allInteractions.length > 0 ? (
                  <div className="space-y-3">
                    {allInteractions.map((interaction, i) => (
                      <div key={interaction.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', interaction.sentiment === 'positive' ? 'bg-emerald-500' : interaction.sentiment === 'negative' ? 'bg-red-400' : 'bg-muted-foreground')} />
                          {i < allInteractions.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-foreground capitalize">{interaction.type}</p>
                            <p className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(interaction.date)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{interaction.summary}</p>
                          {interaction.followUpRequired && interaction.followUpNote && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                              <Lightning size={11} />
                              {interaction.followUpNote}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No activity yet.</p>
                )}
              </div>
            )}

            {tab === 'documents' && (
              <div className="rounded-2xl border bg-card p-8 flex flex-col items-center text-center gap-2">
                <FileText size={28} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No documents yet</p>
                <p className="text-xs text-muted-foreground max-w-[220px]">
                  Files and attachments shared with {contact.name.split(' ')[0]} will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LogInteractionSheet open={followUpOpen} onClose={() => setFollowUpOpen(false)} contactName={contact.name} defaultType="meeting" />
      <WhatsAppComposer open={whatsAppOpen} onClose={() => setWhatsAppOpen(false)} recipientName={contact.name} phone={contact.phone} />
      <EmailComposer open={emailOpen} onClose={() => setEmailOpen(false)} recipientName={contact.name} email={contact.email} />
      <NotesComposer open={notesOpen} onClose={() => setNotesOpen(false)} recipientName={contact.name} onSave={saveNote} />
      <VideoCallPicker open={videoOpen} onClose={() => setVideoOpen(false)} recipientName={contact.name} />
      <ContactActionsSheet open={actionsOpen} onClose={() => setActionsOpen(false)} recipientName={contact.name} actions={quickActions} />
    </div>
  )
}

function NoteCard({ note }: { note: ContactNote }) {
  return (
    <div className={cn('rounded-xl p-3 text-sm text-foreground leading-relaxed border', note.privacyLevel === 'leader_only' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-muted border-transparent')}>
      {note.privacyLevel === 'leader_only' && (
        <div className="flex items-center gap-1 mb-1.5">
          <Lock size={11} className="text-red-500" weight="fill" />
          <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">Leader Only</span>
        </div>
      )}
      {note.content}
      <p className="text-[10px] text-muted-foreground mt-2">{formatRelativeTime(note.updatedAt)}</p>
    </div>
  )
}

function InteractionRow({ interaction }: { interaction: ContactInteraction }) {
  return (
    <div className="flex items-start gap-2">
      <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', interaction.sentiment === 'positive' ? 'bg-emerald-500' : interaction.sentiment === 'negative' ? 'bg-red-400' : 'bg-muted-foreground')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-foreground capitalize">{interaction.type}</p>
          <p className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(interaction.date)}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{interaction.summary}</p>
      </div>
    </div>
  )
}
